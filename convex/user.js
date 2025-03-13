import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if the user already exists by email
    const user = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    // If user doesn't exist, insert a new user
    if (user?.length == 0) {
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


export const userUpgradePlan = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    
    if(result){
      await ctx.db.patch(result[0]._id, {upgrade: true });
      return "Success...";
    }
    return 'error'
  }
});


export const GetUserInfo = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    if(!args?.email){
      return;
    }
    const result = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args?.email))
      .collect();

    return result[0];
  },
})