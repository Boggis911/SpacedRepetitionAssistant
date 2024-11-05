
import { processItemsInParallel } from './dataFlowManager.mjs';
import { invokeUserActivityTrackerAsync } from "./analyticsInvoker.mjs";

// Handler function
export const handler = async (eventObj) => {
    const startTimestamp = Date.now();
    console.log(`Total start time: ${startTimestamp} ms`);

    console.log("Received event:", JSON.stringify(eventObj, null, 2));

    const userIdStr = eventObj.requestContext.authorizer.jwt.claims.sub;

    
    //security
   //NOT SHOWN

 // analytics
 
 invokeUserActivityTrackerAsync(bodyObj, userIdStr);



    try {
        const { results = [], errors = [] } = await processItemsInParallel(bodyObj.itemsArrObj, userIdStr);

        const endTimestamp = Date.now();
        console.log(`Total elapsed time: ${endTimestamp - startTimestamp} ms`);

        if (errors.length > 0) {
            console.error("Errors occurred during processing:", errors);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Some itemsArrObj failed to update", errors }),
            };
        }

        const responseArr = results.map(itemObj => ({
            questionTextStr: itemObj.questionTextStr,
            nextReviewDateStr: itemObj.nextReviewDateStr
        }));

        console.log("All itemsArrObj processed successfully:", JSON.stringify(responseArr, null, 2));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "All itemsArrObj updated successfully", data: responseArr }),
        };
    } catch (errorObj) {
        const errorTimestamp = Date.now();
        console.error(`Error elapsed time: ${errorTimestamp - startTimestamp} ms`);
        console.error("Error updating itemsArrObj:", errorObj);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to update itemsArrObj" }),
        };
    }
};
