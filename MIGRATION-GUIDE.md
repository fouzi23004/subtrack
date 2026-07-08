# Firebase to PostgreSQL Migration Guide

## Summary

Your SubTrack application has been successfully migrated from Firebase to PostgreSQL!

## What Changed

### Authentication
- **Before**: Firebase Authentication with Google Sign-In
- **After**: JWT-based authentication with email/password

### Database
- **Before**: Firebase Firestore (configured but not actively used)
- **After**: PostgreSQL with Drizzle ORM

### User Model
- **Before**: Users identified by Firebase UID (text)
- **After**: Users identified by auto-incrementing ID (integer) with email/password

## Database Setup

### PostgreSQL Container
Your PostgreSQL database is running in Docker:
```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# View logs
docker logs subtrack-postgres

# Access PostgreSQL CLI
docker exec -it subtrack-postgres psql -U subtrack_user -d subtrack
```

### Database Credentials
- **Host**: localhost
- **Port**: 5432
- **Database**: subtrack
- **User**: subtrack_user
- **Password**: subtrack_password

These are configured in both `.env` and `docker-compose.yml`.

### Admin Account
An admin account has been created for you:
- **Email**: admin@subtrack.com
- **Password**: admin123456

⚠️ **IMPORTANT**: Change this password after your first login!

To create additional admin accounts or reset the admin password:
```bash
npx tsx create-admin.ts
```

## Running the Application

### Development
```bash
# Start PostgreSQL (if not running)
docker-compose up -d

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000

### Database Migrations

If you make changes to the schema (`src/db/schema.ts`):

```bash
# Generate migration files
npx drizzle-kit generate

# Run migrations
npx tsx migrate.ts
```

## Application Features

### New Login Page
- Email/password registration
- Email/password login
- Form validation (minimum 6 characters for password)
- Toggle between login and register modes

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### Protected Routes (require Bearer token)
- `GET /api/entreprises` - Get user's companies
- `POST /api/entreprises` - Create company
- `PUT /api/entreprises/:id` - Update company
- `DELETE /api/entreprises/:id` - Delete company
- `GET /api/subscriptions` - Get user's subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

## Database Schema

### users
- `id` (serial, primary key)
- `email` (text, unique, not null)
- `password` (text, not null) - bcrypt hashed
- `created_at` (timestamp)

### entreprises
- `id` (serial, primary key)
- `user_id` (integer, foreign key → users.id)
- `name` (text, not null)
- `created_at` (timestamp)

### subscriptions
- `id` (serial, primary key)
- `user_id` (integer, foreign key → users.id)
- `entreprise_id` (integer, foreign key → entreprises.id)
- `entreprise_name` (text, not null)
- `quantity` (integer, not null)
- `type` (text, not null) - 'licence' or 'licence_puce'
- `end_date` (text, not null) - YYYY-MM-DD format
- `created_at` (timestamp)

## Security Notes

### JWT Secret
⚠️ **IMPORTANT**: The JWT secret in `.env` is set to a default value. For production, generate a secure random secret:

```bash
# Generate a secure secret (use one of these methods)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# or
openssl rand -hex 64
```

Update the `JWT_SECRET` in your `.env` file with this value.

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Minimum password length: 6 characters
- Passwords are never stored in plain text

### Token Expiration
- JWT tokens expire after 7 days
- Users will need to re-login after expiration

## Files Added/Modified

### New Files
- `src/lib/auth.ts` - JWT and password utilities
- `src/auth.ts` - Frontend authentication functions
- `migrate.ts` - Database migration script
- `docker-compose.yml` - PostgreSQL container config
- `drizzle.config.ts` - Drizzle Kit configuration
- `.env` - Environment variables

### Modified Files
- `src/db/schema.ts` - Updated user model and foreign keys
- `src/middleware/auth.ts` - JWT verification instead of Firebase
- `src/App.tsx` - New login/register UI
- `src/hooks/useEntreprises.ts` - Updated auth checks
- `src/hooks/useSubscriptions.ts` - Updated auth checks
- `src/lib/api.ts` - JWT token handling
- `server.ts` - Auth endpoints and updated routes
- `.env.example` - Updated environment variables
- `package.json` - Removed Firebase, added JWT/bcrypt

### Removed Files
- `src/lib/firebase-admin.ts`
- `src/db/users.ts`
- `firebase-applet-config.json`
- `firebase-blueprint.json`
- `firestore.rules`

## Testing the Application

1. **Start the application**:
   ```bash
   docker-compose up -d
   npm run dev
   ```

2. **Open http://localhost:3000** in your browser

3. **Register a new account**:
   - Click "Pas de compte ? S'inscrire"
   - Enter email and password (min 6 characters)
   - Click "S'inscrire"

4. **Use the application**:
   - Create companies (entreprises)
   - Add subscriptions
   - View calendar
   - All data is now stored in PostgreSQL!

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep subtrack-postgres

# View PostgreSQL logs
docker logs subtrack-postgres

# Restart PostgreSQL
docker-compose restart
```

### Migration Issues
```bash
# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
npx tsx migrate.ts
```

### Port Conflicts
If port 5432 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use port 5433 on host instead
```

Then update `.env`:
```
SQL_HOST=localhost:5433
```

## Next Steps

1. ✅ PostgreSQL is running in Docker
2. ✅ Database schema is migrated
3. ✅ Application is running
4. ⚠️ Update JWT_SECRET for production
5. Consider adding:
   - Password reset functionality
   - Email verification
   - Remember me functionality
   - OAuth providers (Google, GitHub, etc.)

## Support

For issues or questions:
1. Check the server logs in the terminal
2. Check PostgreSQL logs: `docker logs subtrack-postgres`
3. Verify database tables: `docker exec subtrack-postgres psql -U subtrack_user -d subtrack -c "\dt"`
