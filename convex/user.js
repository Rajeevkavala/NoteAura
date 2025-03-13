import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create user mutation
export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user already exists by email
    const existingUser = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    // If the user doesn't exist, insert a new user
    if (existingUser.length === 0) {
      await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName,  // Fixed here: using args.userName instead of args.email
        imageUrl: args.imageUrl,
        upgrade: false,
      });

      return "Inserted New User...";
    }

    return "User Already Exists";
  },
});

// User upgrade plan mutation
export const userUpgradePlan = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    
    if (result.length > 0) {
      // Upgrade the user's plan
      await ctx.db.patch(result[0]._id, { upgrade: true });
      return "Success: User upgraded.";
    }
    
    return "Error: User not found.";
  }
});

// Get user info query
export const GetUserInfo = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args?.email) {
      return { error: "Email is required." };
    }
    
    const result = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    if (result.length > 0) {
      return result[0]; // Return user data if found
    }

    return { error: "User not found." };
  },
});
