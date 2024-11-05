// createMultipleRevisionItems
// index.mjs

import { createRevisionItems } from "./databaseServices.mjs";
import { invokeUserActivityTrackerAsync } from "./analyticsInvoker.mjs";

// Handler function
export const handler = async (eventObj) => {
    console.log("Received event:", JSON.stringify(eventObj, null, 2));
    
    const userIdStr = eventObj.requestContext.authorizer.jwt.claims.sub;

    const bodyObj = JSON.parse(eventObj.body);
    console.log("Parsed body:", JSON.stringify(bodyObj, null, 2));
    
    // Security validation
    // NOT SHOWN
    
    // Analytics tracking
    invokeUserActivityTrackerAsync(bodyObj, userIdStr);

    try {
        const dataObj = await createRevisionItems(bodyObj.itemsArrObj, userIdStr);
        console.log("Batch write response:", JSON.stringify(dataObj, null, 2));
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Revision items created successfully", nextReviewDate: "Tomorrow" }),
        };
    } catch (errorObj) {
        console.error("Error creating revision items:", errorObj);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to create revision items" }),
        };
    }
};
