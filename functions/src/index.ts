import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * 🔥 PHASE 24 — Auto Update Villa Rating
 * Triggered when a new review is created
 */
export const updateVillaRating = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap, context) => {
    const review = snap.data();

    if (!review || !review.villa_id) {
      console.log("Invalid review data");
      return;
    }

    const villaId = review.villa_id;

    try {
      // 1️⃣ Fetch all reviews for this villa
      const reviewsSnap = await db
        .collection("reviews")
        .where("villa_id", "==", villaId)
        .get();

      if (reviewsSnap.empty) {
        console.log("No reviews found");
        return;
      }

      // 2️⃣ Calculate average rating
      let total = 0;
      let count = 0;

      reviewsSnap.forEach((doc) => {
        const data = doc.data();
        if (typeof data.rating === "number") {
          total += data.rating;
          count++;
        }
      });

      const avgRating = Number((total / count).toFixed(1));

      // 3️⃣ Update villa document (ADMIN PRIVILEGE)
      await db.collection("villas").doc(villaId).update({
        avg_rating: avgRating,
        reviews_count: count,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Villa ${villaId} rating updated: ${avgRating}`);
    } catch (error) {
      console.error("Error updating villa rating:", error);
    }
  });



  