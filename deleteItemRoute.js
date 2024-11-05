


const ddbClient = new DynamoDBClient({ region: process.env.DEFAULT_REGION });
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";



import { invokeUserActivityTrackerAsync } from "./analyticsInvoker.mjs";


export const handler = async (eventObj) => {
  const startTime = new Date().getTime();
  console.log(`Start time: ${new Date(startTime).toISOString()}`);

  const userIdStr = eventObj.requestContext.authorizer.jwt.claims.sub;

  const bodyObj = JSON.parse(eventObj.body);

  invokeUserActivityTrackerAsync(bodyObj, userIdStr);

  const itemsArrObj = bodyObj.itemsArrObj;
  
  const deletePromises = itemsArrObj.map((itemStr) => {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        userIdStr: userIdStr,
        nextReviewDateStr: itemStr.itemUniqueIdStr,
      },
    };

    return ddbClient.send(new DeleteCommand(params));
  });

  try {
    await Promise.all(deletePromises);
    const endTime = new Date().getTime();
    console.log(`End time: ${new Date(endTime).toISOString()}`);
    console.log(`Total time elapsed: ${endTime - startTime} ms`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Items deleted successfully" }),
    };
  } catch (error) {
    const endTime = new Date().getTime();
    console.error(`Error deleting items: ${error}`);
    console.log(`End time: ${new Date(endTime).toISOString()}`);
    console.log(`Total time elapsed: ${endTime - startTime} ms`);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete items" }),
    };
  }
};
