const { z } = require('zod');

const createElectionSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    candidates: z.array(z.object({
        name: z.string().min(3),
        vision: z.string().optional(),
        mission: z.string().optional(),
      })).min(2, "At least 2 candidates are required"),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
});

module.exports = { createElectionSchema };
