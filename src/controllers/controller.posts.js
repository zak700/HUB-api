import { db } from "../database/postgres.js";

async function getPosts(req, res) {
  const { page } = req.params;
  try {
    const posts = await db("posts")
      .select("*")
      .limit(10)
      .offset(page * 10);
    const totalPosts = await db("posts").count("* as count").first();
    const totalPages = Math.ceil(totalPosts.count / 10);

    return res.status(200).json({ posts, totalPages });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getPostById(req, res) {
  const { id } = req.params;
  try {
    const post = await db("posts").select("*").where({ id }).first();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default {
  getPosts,
  getPostById,
};
