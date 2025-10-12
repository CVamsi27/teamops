import { sql } from '@vercel/postgres';

export const db = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: number } }) => {
      if (where.email === 'test@example.com' || where.id === 1) {
        return {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewRuHVjHyW9XBo6u', // "password"
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return null;
    },
    
    create: async ({ data }: { data: { email: string; password: string; name: string } }) => {
      return {
        id: Math.floor(Math.random() * 1000),
        email: data.email,
        name: data.name,
        password: data.password,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  },
  
  team: {
    findMany: async ({ where, include }: any) => {
      return [
        {
          id: 1,
          name: 'Development Team',
          description: 'Main development team',
          ownerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [
            {
              id: 1,
              userId: 1,
              teamId: 1,
              role: 'OWNER',
              user: {
                id: 1,
                email: 'test@example.com',
                name: 'Test User'
              }
            }
          ],
          projects: [
            {
              id: 1,
              name: 'TeamOps App',
              status: 'ACTIVE'
            }
          ]
        }
      ];
    },
    
    create: async ({ data, include }: any) => {
      return {
        id: Math.floor(Math.random() * 1000),
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            id: Math.floor(Math.random() * 1000),
            userId: data.ownerId,
            teamId: Math.floor(Math.random() * 1000),
            role: 'OWNER',
            user: {
              id: data.ownerId,
              email: 'test@example.com',
              name: 'Test User'
            }
          }
        ],
        projects: []
      };
    }
  },

  // Direct SQL query function for when we need raw queries
  query: async (query: string, params: any[] = []) => {
    try {
      if (process.env.POSTGRES_URL) {
        return await sql.query(query, params);
      } else {
        return { rows: [], rowCount: 0 };
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

// Connection check
export async function checkDatabaseConnection() {
  try {
    if (process.env.POSTGRES_URL) {
      await sql`SELECT 1`;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}