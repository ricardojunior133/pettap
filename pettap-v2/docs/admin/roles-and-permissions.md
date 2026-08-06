# Roles and permissions

## Roles

| Role | Intended scope |
| --- | --- |
| `support` | Customer, pet, NFC-tag, order and payment-status reading. |
| `operations` | Production, inventory and fulfilment operations. |
| `admin` | Catalog, operations, support and non-critical settings. |
| `super_admin` | All known permissions, including team access management. |

## Access matrix

| Resource | Customer | Support | Operations | Admin | Super admin |
| --- | --- | --- | --- | --- | --- |
| Admin dashboard | No | Yes | Yes | Yes | Yes |
| Customers read | No | Yes | Yes | Yes | Yes |
| Orders read | No | Yes | Yes | Yes | Yes |
| Fulfilment manage | No | No | Yes | Yes | Yes |
| Products manage | No | No | No | Yes | Yes |
| Team access | No | No | No | No | Yes |
| Audit logs | No | No | No | Yes | Yes |

The navigation merely reflects these permissions. Each future page, action, route handler and service must call the corresponding server-side permission guard again.
