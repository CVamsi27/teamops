import { sql } from "@vercel/postgres";

export const db = {
  user: {
    findUnique: async ({
      where: _where,
    }: {
      where: { email?: string; id?: number };
    }) => {
      const where = _where;
      if (where.email === "test@example.com" || where.id === 1) {
        return {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          password:
            "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRuHVjHyW9XBo6u", // "password"
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    },

    create: async ({
      data,
    }: {
      data: { email: string; password: string; name: string };
    }) => {
      return {
        id: Math.floor(Math.random() * 1000),
        email: data.email,
        name: data.name,
        password: data.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },

  team: {
    findMany: async (_opts: unknown) => {
      void _opts;
      return [
        {
          id: 1,
          name: "Development Team",
          description: "Main development team",
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [
            {
              id: 1,
              userId: 1,
              teamId: 1,
              role: "OWNER",
              user: {
                id: 1,
                email: "test@example.com",
                name: "Test User",
              },
            },
          ],
          projects: [
            {
              id: 1,
              name: "TeamOps App",
              status: "ACTIVE",
            },
          ],
        },
      ];
    },

    create: async (args: Record<string, unknown>) => {
      const data = (args?.data as Record<string, unknown>) || {};
      const name = typeof data.name === 'string' ? data.name : undefined;
      const description = typeof data.description === 'string' ? data.description : undefined;
      const ownerId = typeof data.ownerId === 'number' ? data.ownerId : undefined;
      return {
        id: Math.floor(Math.random() * 1000),
        name,
        description,
        ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            id: Math.floor(Math.random() * 1000),
            userId: data.ownerId,
            teamId: Math.floor(Math.random() * 1000),
            role: "OWNER",
            user: {
              id: data.ownerId,
              email: "test@example.com",
              name: "Test User",
            },
          },
        ],
        projects: [],
      };
    },
  },

  query: async (query: string, params: unknown[] = []) => {
    try {
      if (process.env.POSTGRES_URL) {
        return await sql.query(query, params);
      } else {
        return { rows: [], rowCount: 0 };
      }
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
};

export async function checkDatabaseConnection() {
  try {
    if (process.env.POSTGRES_URL) {
      await sql`SELECT 1`;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
