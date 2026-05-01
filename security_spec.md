# Security Specification - IPMRI Inventory System

## 1. Data Invariants
- An item's quantity cannot be negative.
- Stock movements must reference a valid itemId.
- Production logs must have at least one raw material and one finished good.
- Users must have a role assigned upon creation (defaulting to 'staff' if not admin-created, or restricted to admin only).
- Immutable fields: `createdAt` on all documents.

## 2. The Dirty Dozen Payloads (Targeting Rules)

1. **Identity Theft**: Attempt to create a user with `role: 'admin'` as an unauthenticated user.
2. **Role Escalation**: Existing 'staff' user tries to update their own role to 'admin'.
3. **Negative Stock**: Attempt to set an item's `quantity` to `-50`.
4. **Phantom Movement**: Create a `StockMovement` for a non-existent `itemId`.
5. **Unauthorized Categorization**: 'staff' user tries to delete a `Category`.
6. **Shadow Field Injection**: Add a `isVerified: true` field to an `Item` document during creation.
7. **Date Spoofing**: Set `date` in `StockMovement` to a future date manually (not using server timestamp).
8. **Orphaned Production**: Log a production run where `rawMaterials` is an empty array.
9. **Price Manipulation** (if added): Staff changing item unit prices (if applicable).
10. **Data Scraping**: Unauthenticated user trying to list all `users`.
11. **PII Leak**: Non-admin user trying to read private email addresses of other users (if separated).
12. **Terminal Lock Breach**: Trying to delete a `production_log` (should be immutable for auditing).

## 3. Test Runner Logic (Conceptual)
Tests will verify that these payloads return `PERMISSION_DENIED`.
