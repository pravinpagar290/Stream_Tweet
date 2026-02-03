import mongoose from "mongoose";
import "dotenv/config";

const fixUsernameField = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");
    console.log("Starting username field migration...\n");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // Count documents with each field
    const userNameCount = await usersCollection.countDocuments({
      userName: { $exists: true },
    });
    const usernameCount = await usersCollection.countDocuments({
      username: { $exists: true },
    });

    console.log(`Documents with 'userName': ${userNameCount}`);
    console.log(`Documents with 'username': ${usernameCount}\n`);

    if (userNameCount === 0) {
      console.log(
        "No documents with 'userName' field found. Migration not needed."
      );
      return;
    }

    // Strategy: Copy userName to username for docs that only have userName
    console.log("Migrating documents with 'userName' field...");

    const docsWithUserName = await usersCollection
      .find({
        userName: { $exists: true },
        username: { $exists: false }, // Only update if username doesn't exist
      })
      .toArray();

    console.log(`Found ${docsWithUserName.length} documents to migrate`);

    for (const doc of docsWithUserName) {
      try {
        await usersCollection.updateOne(
          { _id: doc._id },
          {
            $set: { username: doc.userName },
            $unset: { userName: "" },
          }
        );
        console.log(`✓ Migrated user: ${doc.userName} (${doc._id})`);
      } catch (err) {
        console.error(`✗ Failed to migrate ${doc._id}:`, err.message);
      }
    }

    console.log("\nMigration completed!");

    // Final verification
    const finalUserNameCount = await usersCollection.countDocuments({
      userName: { $exists: true },
    });
    const finalUsernameCount = await usersCollection.countDocuments({
      username: { $exists: true },
    });

    console.log(`\nFinal counts:`);
    console.log(`Documents with 'userName': ${finalUserNameCount}`);
    console.log(`Documents with 'username': ${finalUsernameCount}`);
  } catch (error) {
    console.error("\nMigration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  }
};

fixUsernameField();
