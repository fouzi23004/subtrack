# Admin Account Details

## Default Admin Credentials

Your admin account has been successfully created!

### Login Details
```
Email:    admin@subtrack.com
Password: admin123456
```

## How to Login

1. Open http://localhost:3000 in your browser
2. Enter the email: `admin@subtrack.com`
3. Enter the password: `admin123456`
4. Click "Se connecter"

## Security Recommendations

⚠️ **IMPORTANT SECURITY STEPS**:

1. **Change the default password immediately** after your first login
2. **Use a strong password** with:
   - At least 12 characters
   - Mix of uppercase and lowercase letters
   - Numbers and special characters
   - Example: `MyS3cur3P@ssw0rd!2024`

## Managing Admin Accounts

### Create Additional Admin Accounts

To create more admin accounts, edit the `create-admin.ts` file:

```typescript
const adminEmail = 'newadmin@subtrack.com';
const adminPassword = 'secure_password_here';
```

Then run:
```bash
npx tsx create-admin.ts
```

### Reset Admin Password

If you forget your password, you can reset it using the database:

```bash
# Access PostgreSQL
docker exec -it subtrack-postgres psql -U subtrack_user -d subtrack

# View users
SELECT id, email FROM users;

# Then manually run the create-admin script with the same email
# It will detect the existing user and you can modify it
```

## Database Access

To view all users in the database:

```bash
docker exec subtrack-postgres psql -U subtrack_user -d subtrack -c "SELECT id, email, created_at FROM users;"
```

## Next Steps

1. ✅ Login with the admin account
2. ⚠️ Change the default password
3. ✅ Start creating companies (entreprises)
4. ✅ Add subscriptions
5. ✅ Explore the calendar view

## Troubleshooting

### Can't Login?

1. **Check the server is running**:
   ```bash
   # Should show server running on port 3000
   npm run dev
   ```

2. **Check PostgreSQL is running**:
   ```bash
   docker ps | grep subtrack-postgres
   ```

3. **Verify the account exists**:
   ```bash
   docker exec subtrack-postgres psql -U subtrack_user -d subtrack -c "SELECT * FROM users WHERE email='admin@subtrack.com';"
   ```

4. **Recreate the admin account**:
   ```bash
   npx tsx create-admin.ts
   ```

### Password Not Working?

If you're sure you're using the correct password but still can't login:

1. Check the browser console for errors (F12)
2. Check the server logs for authentication errors
3. Try recreating the account (it will skip if it already exists)

## Support

For any issues:
- Check server logs in the terminal
- Check `MIGRATION-GUIDE.md` for detailed setup information
- Verify all services are running: PostgreSQL + Development Server
