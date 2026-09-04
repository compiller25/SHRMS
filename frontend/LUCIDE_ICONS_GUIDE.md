# Lucide Icons Implementation Guide - SMRS

This guide shows the Lucide React icons used throughout the SMRS project.

## Installation
```bash
npm install lucide-react
```

## Icon Mapping for SMRS

### Property & Real Estate Icons
```jsx
import { 
  Building2,      // Properties/Buildings
  Home,           // Houses/Units
  MapPin,         // Location/Address
  DoorOpen,       // Available units
  Key             // Access/Keys
} from 'lucide-react';
```

### User & People Icons
```jsx
import {
  User,           // Single user
  Users,          // Multiple users/tenants
  UserCog,        // Admin user
  UserCheck,      // Verified user
  Briefcase       // Landlord/Business
} from 'lucide-react';
```

### Financial Icons
```jsx
import {
  DollarSign,     // Money/Payments
  CreditCard,     // Payment method
  Wallet,         // Wallet/Account
  TrendingUp,     // Revenue increase
  Receipt,        // Invoice/Receipt
  Banknote        // Cash payment
} from 'lucide-react';
```

### Document & Agreement Icons
```jsx
import {
  FileText,       // Documents/Agreements
  FileCheck,      // Approved documents
  FileX,          // Rejected documents
  ClipboardList,  // Applications
  ScrollText      // Contracts
} from 'lucide-react';
```

### Status & Notification Icons
```jsx
import {
  CheckCircle,    // Success/Approved
  XCircle,        // Error/Rejected
  Clock,          // Pending/Time
  AlertCircle,    // Warning/Alert
  Bell,           // Notifications
  AlertTriangle   // Important warning
} from 'lucide-react';
```

### Navigation & Action Icons
```jsx
import {
  LayoutDashboard, // Dashboard
  Search,          // Search functionality
  Settings,        // Settings
  LogOut,          // Logout
  Menu,            // Mobile menu
  X,               // Close
  ChevronDown,     // Dropdown
  ChevronRight,    // Next/Forward
  ArrowRight       // Navigate
} from 'lucide-react';
```

### Chart & Analytics Icons
```jsx
import {
  BarChart3,      // Bar charts
  LineChart,      // Line charts
  PieChart,       // Pie charts
  TrendingUp,     // Growth
  Activity        // Activity/Stats
} from 'lucide-react';
```

### Communication Icons
```jsx
import {
  Mail,           // Email
  Phone,          // Phone number
  MessageSquare,  // Messages/Chat
  Send            // Send message
} from 'lucide-react';
```

### Calendar & Time Icons
```jsx
import {
  Calendar,       // Date picker
  CalendarDays,   // Multiple dates
  Clock           // Time/Duration
} from 'lucide-react';
```

## Usage Examples

### Basic Usage
```jsx
import { Home } from 'lucide-react';

<Home className="w-6 h-6 text-lime-green" />
```

### With Custom Styling
```jsx
import { Building2 } from 'lucide-react';

<Building2 
  size={24} 
  color="#99CC33" 
  strokeWidth={2}
  className="mr-2"
/>
```

### Responsive Sizing
```jsx
import { User } from 'lucide-react';

<User className="w-4 h-4 md:w-6 md:h-6" />
```

## Component-Specific Icons

### Navbar
- **Logo area:** Home
- **Dashboard:** LayoutDashboard
- **Marketplace:** Search
- **User menu:** User, Settings, LogOut

### Tenant Pages
- **Marketplace:** Building2, MapPin, Search
- **Applications:** FileText, Clock, CheckCircle, XCircle
- **Rentals:** Home, Calendar, Receipt
- **Payments:** DollarSign, CreditCard, Receipt

### Landlord Pages
- **Dashboard:** LayoutDashboard, BarChart3, TrendingUp
- **Properties:** Building2, Home, MapPin
- **Units:** DoorOpen, Key
- **Agreements:** FileCheck, FileX, ClipboardList

### Admin Pages
- **Dashboard:** UserCog, Activity, BarChart3
- **Users:** Users, UserCheck
- **Statistics:** PieChart, LineChart

## Color Reference

Use these with your brand colors:
```jsx
// Primary Blue (#003152)
<Home className="text-[#003152]" />

// Lime Green (#99CC33) - for CTAs
<CheckCircle className="text-[#99CC33]" />

// Dark Teal (#003333)
<Building2 className="text-[#003333]" />

// Or use Tailwind classes
<Home className="text-primary-blue" />
<CheckCircle className="text-lime-green" />
```

## Size Reference

```jsx
// Extra small
<Icon size={16} />  // or className="w-4 h-4"

// Small
<Icon size={20} />  // or className="w-5 h-5"

// Medium (default)
<Icon size={24} />  // or className="w-6 h-6"

// Large
<Icon size={32} />  // or className="w-8 h-8"

// Extra large
<Icon size={48} />  // or className="w-12 h-12"
```

## Stroke Width

Lucide icons support different stroke widths:
```jsx
<Home strokeWidth={1} />   // Thin
<Home strokeWidth={1.5} /> // Light
<Home strokeWidth={2} />   // Regular (default)
<Home strokeWidth={2.5} /> // Medium
<Home strokeWidth={3} />   // Bold
```

## Common Patterns

### Icon with Text
```jsx
import { MapPin } from 'lucide-react';

<div className="flex items-center">
  <MapPin className="w-5 h-5 text-lime-green mr-2" />
  <span>Magomeni, Dar es Salaam</span>
</div>
```

### Status Badge with Icon
```jsx
import { CheckCircle } from 'lucide-react';

<span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
  <CheckCircle className="w-4 h-4 mr-1" />
  Approved
</span>
```

### Button with Icon
```jsx
import { Plus } from 'lucide-react';

<button className="flex items-center px-4 py-2 bg-lime-green rounded-lg">
  <Plus className="w-5 h-5 mr-2" />
  Add Property
</button>
```

## Performance Tips

1. **Import only what you need:**
   ```jsx
   // Good
   import { Home, Building2 } from 'lucide-react';
   
   // Avoid
   import * as Icons from 'lucide-react';
   ```

2. **Tree-shaking works automatically** - Vite will only bundle icons you use

3. **Icons are optimized** - Lucide icons are lightweight and performant

## Migration from SVG

### Before (SVG)
```jsx
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3..." />
</svg>
```

### After (Lucide)
```jsx
import { Home } from 'lucide-react';
<Home className="w-6 h-6" />
```

## Resources

- **Official Docs:** https://lucide.dev/guide/packages/lucide-react
- **Icon Search:** https://lucide.dev/icons
- **GitHub:** https://github.com/lucide-icons/lucide

## Quick Reference Card

| Purpose | Icon Name | Import |
|---------|-----------|--------|
| Property | `Building2` | `import { Building2 } from 'lucide-react'` |
| House | `Home` | `import { Home } from 'lucide-react'` |
| User | `User` | `import { User } from 'lucide-react'` |
| Money | `DollarSign` | `import { DollarSign } from 'lucide-react'` |
| Document | `FileText` | `import { FileText } from 'lucide-react'` |
| Approved | `CheckCircle` | `import { CheckCircle } from 'lucide-react'` |
| Rejected | `XCircle` | `import { XCircle } from 'lucide-react'` |
| Pending | `Clock` | `import { Clock } from 'lucide-react'` |
| Location | `MapPin` | `import { MapPin } from 'lucide-react'` |
| Calendar | `Calendar` | `import { Calendar } from 'lucide-react'` |
| Payment | `CreditCard` | `import { CreditCard } from 'lucide-react'` |
| Dashboard | `LayoutDashboard` | `import { LayoutDashboard } from 'lucide-react'` |
