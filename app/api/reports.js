import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);
const db = client.db("lead-reports");
const reports = db.collection("reports");

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { page = 1, limit = 10 } = req.query;
    const skipRecords = (page - 1) * limit;

    try {
      await client.connect();
      const reportsList = await reports.find({})
        .sort({ createdAt: -1 })
        .skip(skipRecords)
        .limit(parseInt(limit))
        .toArray();

      const totalReports = await reports.countDocuments();
      res.status(200).json({ reports: reportsList, totalReports });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 