
// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.DEFAULT_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { invokeUserActivityTracker } from "./analyticsInvoker.mjs";

// Handler function
export const handler = async (eventObj) => {
    console.log("Received event:", JSON.stringify(eventObj, null, 2));

    const userIdStr = eventObj.requestContext.authorizer.jwt.claims.sub;

    const currentDateStr = new Date().toISOString();


    try {
        const dataObj = await ddbDocClient.send(new QueryCommand(paramsObj));
        if (dataObj.Items.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "There are no items to review at the moment" }),
            };
        }

        const itemsArrObj = dataObj.Items.map(itemObj => {
            const {
                nextReviewDateStr: itemUniqueIdStr,
                creationDateStr, // omitted
                currentSpacingIntervalDaysInt, // omitted
                ...remainingAttributesObj
            } = itemObj;

            return {
                itemUniqueIdStr,
                ...remainingAttributesObj
            };
        });

        console.log(itemsArrObj);

        const responseObj = {
            itemsArrObj,
        };

        // Synchronously invoke User Activity Tracker
        await invokeUserActivityTracker(responseObj, userIdStr);

        return {
            statusCode: 200,
            body: JSON.stringify({ items: itemsArrObj }),
        };
    } catch (errorObj) {
        console.error("Error fetching revision items:", errorObj);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to fetch revision items" }),
        };
    }
};
