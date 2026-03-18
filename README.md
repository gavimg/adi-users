# Gadagi Users - User Management Micro-frontend

A dedicated micro-frontend for user management functionality within the Gadagi platform architecture.

## Overview

Gadagi Users is a remote micro-frontend that handles user CRUD operations, profile management, and user administration features. It's designed to be loaded dynamically by the Gadagi Host application using Webpack Module Federation.

## Features

- 👥 **User Management** - Complete CRUD operations for users
- 📊 **User Analytics** - User statistics and insights
- 🔍 **Advanced Search** - Filter and search capabilities
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Theme Integration** - Consistent with design system
- 🔐 **Role-Based Access** - Permission-based features

## Architecture

```
┌─────────────────────────────────────┐
│            Gadagi Users               │
│  ┌─────────────┬─────────────────┐  │
│  │ User List   │ User Details    │  │
│  │ - Search    │ - Profile       │  │
│  │ - Filters   │ - Permissions   │  │
│  │ - Actions   │ - Activity      │  │
│  └─────────────┴─────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │      User Form                 │  │
│  │  - Create/Edit User            │  │
│  │  - Validation                  │  │
│  │  - Save/Cancel                 │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Development Server

- **Development URL**: http://localhost:3001
- **Remote Entry**: http://localhost:3001/remoteEntry.js

## Module Federation Configuration

### Remote Configuration

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('@module-federation/enhanced');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'adiUsers',
      filename: 'remoteEntry.js',
      exposes: {
        './UsersApp': './src/UsersApp.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@gadagi/types': { singleton: true },
        '@gadagi/design-system': { singleton: true },
      },
    }),
  ],
};
```

### Exposed Module

```typescript
// src/UsersApp.tsx
import React from 'react';
import { UserList, UserForm, UserProfile } from './components';

const UsersApp: React.FC = () => {
  return (
    <div style={{ padding: '2rem', background: '#e0f2fe', minHeight: '100vh' }}>
      <h1>Users Module</h1>
      <p>This is the adi-users micro-frontend.</p>
      
      {/* User Management Components */}
      <UserList />
      <UserForm />
      <UserProfile />
    </div>
  );
};

export default UsersApp;
```

## Components

### UserList

Display and manage user listings with search and filtering.

```tsx
import { UserList } from './components/UserList';

<UserList
  users={users}
  onUserSelect={handleUserSelect}
  onUserDelete={handleUserDelete}
  loading={loading}
/>
```

**Props:**
- `users: User[]` - Array of user objects
- `onUserSelect?: (user: User) => void` - User selection handler
- `onUserDelete?: (userId: string) => void` - User deletion handler
- `loading?: boolean` - Loading state
- `searchable?: boolean` - Enable search functionality

### UserForm

Create or edit user information.

```tsx
import { UserForm } from './components/UserForm';

<UserForm
  user={selectedUser}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  mode="create" // or "edit"
/>
```

**Props:**
- `user?: User` - User data for edit mode
- `onSubmit: (user: Partial<User>) => void` - Form submission handler
- `onCancel: () => void` - Cancel handler
- `mode: 'create' | 'edit'` - Form mode

### UserProfile

Display detailed user information and activity.

```tsx
import { UserProfile } from './components/UserProfile';

<UserProfile
  user={selectedUser}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Props:**
- `user: User` - User object to display
- `onEdit?: (user: User) => void` - Edit handler
- `onDelete?: (userId: string) => void` - Delete handler

## Data Management

### User Service

```typescript
// src/services/userService.ts
import { User, ApiResponse } from '@gadagi/types';

export class UserService {
  // Get all users
  static async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
  }

  // Get user by ID
  static async getUser(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  // Create user
  static async createUser(user: Partial<User>): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  }

  // Update user
  static async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
  }
}
```

### State Management

```tsx
// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { User } from '@gadagi/types';
import { UserService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      const newUser = await UserService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError('Failed to create user');
      throw err;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await UserService.updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      setError('Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await UserService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError('Failed to delete user');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};
```

## Features

### Search and Filtering

```tsx
// src/components/UserSearch.tsx
import { Input } from '@gadagi/design-system';

interface UserSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: UserFilters) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="user-search">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
      />
      
      {/* Filter options */}
      <select onChange={(e) => handleFilterChange('role', e.target.value)}>
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
      
      <select onChange={(e) => handleFilterChange('status', e.target.value)}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
};
```

### User Actions

```tsx
// src/components/UserActions.tsx
import { Button } from '@gadagi/design-system';

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}) => {
  return (
    <div className="user-actions">
      <Button size="sm" onClick={() => onEdit(user)}>
        Edit
      </Button>
      
      {user.isActive ? (
        <Button 
          variant="warning" 
          size="sm" 
          onClick={() => onDeactivate(user.id)}
        >
          Deactivate
        </Button>
      ) : (
        <Button 
          variant="success" 
          size="sm" 
          onClick={() => onActivate(user.id)}
        >
          Activate
        </Button>
      )}
      
      <Button 
        variant="danger" 
        size="sm" 
        onClick={() => onDelete(user.id)}
      >
        Delete
      </Button>
    </div>
  );
};
```

## Integration

### Host Integration

The UsersApp component is designed to be loaded by the ADI Host:

```typescript
// In ADI Host
const UsersApp = React.lazy(() => import('adiUsers/UsersApp'));

// Route configuration
<Route path="/users" element={
  <Suspense fallback={<div>Loading Users...</div>}>
    <UsersApp />
  </Suspense>
} />
```

### Shared Dependencies

The micro-frontend shares dependencies with the host:

- React & React DOM
- @gadagi/types
- @gadagi/design-system
- React Router DOM

## Styling

### Theme Integration

```tsx
// Use design system tokens
import { colors, spacing } from '@gadagi/design-system';

const userStyles = {
  container: {
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
  },
  header: {
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
};
```

### Custom Styles

```css
/* src/styles/Users.css */
.users-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

## Testing

### Unit Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Component Tests

```typescript
// src/components/__tests__/UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from '../UserList';

describe('UserList', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  it('renders user list', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles user selection', () => {
    const onSelect = jest.fn();
    render(<UserList users={mockUsers} onUserSelect={onSelect} />);
    
    screen.getByText('John Doe').click();
    expect(onSelect).toHaveBeenCalledWith(mockUsers[0]);
  });
});
```

## Performance Optimization

### Virtual Scrolling

```tsx
// For large user lists
import { FixedSizeList as List } from 'react-window';

const VirtualUserList: React.FC<{ users: User[] }> = ({ users }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <UserCard user={users[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={users.length}
      itemSize={80}
    >
      {Row}
    </List>
  );
};
```

### Memoization

```tsx
import React, { memo } from 'react';

const UserCard = memo(({ user }: { user: User }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

## Deployment

### Environment Configuration

```typescript
// config/environment.ts
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  environment: process.env.NODE_ENV || 'development',
};
```

### Build Configuration

```bash
# Production build
npm run build

# Preview build
npm run preview
```

## Troubleshooting

### Common Issues

1. **Module Loading Failures**
   - Check remote entry URL
   - Verify host is running
   - Check network connectivity

2. **Shared Dependency Conflicts**
   - Ensure version compatibility
   - Check singleton configuration

3. **API Connection Issues**
   - Verify API endpoints
   - Check CORS configuration

## Contributing

1. Follow component patterns
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance

## License

MIT © Gadagi Team
