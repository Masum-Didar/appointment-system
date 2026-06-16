# Healthcare Appointment & Live Queue Management System
## Software Architecture Document

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │   React Native App  │  │   Next.js Web Application    │  │
│  │   (Mobile - Android │  │   (Responsive - All Devices) │  │
│  │    & iOS)           │  │                              │  │
│  └────────┬────────────┘  └──────────────┬───────────────┘  │
│           │                               │                  │
│           └───────────┬───────────────────┘                  │
│                       │ HTTPS/REST                          │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                  API GATEWAY LAYER                          │
│           ┌──────────────────────────┐                      │
│           │   Nginx / Load Balancer  │                      │
│           │   SSL Termination        │                      │
│           │   Rate Limiting          │                      │
│           └────────────┬─────────────┘                      │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Node.js + Express.js Server                │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ │   │
│  │  │ Auth    │ │ Doctor   │ │Appoint-│ │ Payment   │ │   │
│  │  │ Module  │ │ Module   │ │ment    │ │ Module    │ │   │
│  │  │         │ │          │ │Module  │ │           │ │   │
│  │  ├─────────┤ ├──────────┤ ├────────┤ ├───────────┤ │   │
│  │  │ Queue   │ │ Chamber  │ │Notifica│ │ Admin     │ │   │
│  │  │ Module  │ │ Module   │ │tion    │ │ Module    │ │   │
│  │  └─────────┘ └──────────┘ └────────┘ └───────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Socket.IO Server                           │   │
│  │           (Real-Time Queue Engine)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                   DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL   │  │    Redis     │  │    Firebase      │  │
│  │  (Primary DB) │  │  (Session/   │  │  (Push Notif)    │  │
│  │               │  │   Cache)     │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Decision Records

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Backend Framework** | Express.js | Mature, vast ecosystem, suitable for REST APIs |
| **Database** | PostgreSQL | ACID compliance, relational data, complex queries |
| **Cache** | Redis | High-performance in-memory store for queues, sessions |
| **Real-time** | Socket.IO | WebSocket fallback, rooms for per-doctor queues |
| **Mobile** | React Native | Cross-platform, code reuse with web |
| **Web** | Next.js | SSR/SSG, SEO, built-in API routes |
| **Auth** | JWT + Refresh Tokens | Stateless, scalable for mobile + web |
| **Payment** | SSLCommerz | Leading BD payment gateway |
| **Notifications** | Firebase Cloud Messaging | Cross-platform push notifications |
| **Containerization** | Docker + Docker Compose | Development consistency, easy deployment |

---

## 2. Database Architecture

### 2.1 Entity-Relationship Diagram (Textual)

```
USERS (base table for authentication)
├── id (PK, UUID)
├── phone (unique)
├── email (unique, nullable)
├── password_hash
├── role (enum: patient, assistant, doctor, admin)
├── is_active
├── is_verified
├── created_at
├── updated_at
│
├── PATIENTS
│   ├── id (PK, FK → users.id)
│   ├── name
│   ├── date_of_birth
│   ├── gender
│   ├── blood_group
│   ├── address
│   ├── avatar_url
│   └── medical_notes (text)
│
├── DOCTORS
│   ├── id (PK, FK → users.id)
│   ├── name
│   ├── speciality
│   ├── qualifications (JSON)
│   ├── bmdc_registration_number (unique)
│   ├── biography (text)
│   ├── consultation_fee (decimal)
│   ├── follow_up_fee (decimal)
│   ├── discount_percentage (decimal)
│   ├── experience_years (int)
│   ├── available_for_online
│   ├── rating (decimal)
│   ├── total_reviews (int)
│   └── is_verified
│
├── ASSISTANTS
│   ├── id (PK, FK → users.id)
│   ├── name
│   ├── phone
│   └── chamber_id (FK → chambers.id)
│
├── ADMINS
│   ├── id (PK, FK → users.id)
│   ├── name
│   └── permissions (JSON)
│
├── CHAMBERS
│   ├── id (PK, UUID)
│   ├── doctor_id (FK → doctors.id)
│   ├── name
│   ├── address
│   ├── city
│   ├── area
│   ├── latitude (decimal)
│   ├── longitude (decimal)
│   ├── contact_phone
│   ├── facilities (JSON)
│   ├── chamber_type (enum: chamber, hospital, clinic, diagnostic)
│   ├── is_active
│   ├── serial_prefix (varchar)
│   └── created_at
│
├── DOCTOR_SCHEDULES
│   ├── id (PK, UUID)
│   ├── doctor_id (FK → doctors.id)
│   ├── chamber_id (FK → chambers.id)
│   ├── day_of_week (int, 0-6)
│   ├── start_time (time)
│   ├── end_time (time)
│   ├── max_patients (int)
│   ├── slot_duration_minutes (int)
│   ├── is_active
│   └── is_break (boolean)
│
├── APPOINTMENTS
│   ├── id (PK, UUID)
│   ├── patient_id (FK → patients.id)
│   ├── doctor_id (FK → doctors.id)
│   ├── chamber_id (FK → chambers.id)
│   ├── schedule_id (FK → doctor_schedules.id)
│   ├── appointment_date (date)
│   ├── serial_number (int)
│   ├── token_number (varchar: CHAMBER-001)
│   ├── status (enum: pending, confirmed, checked_in, in_consultation, completed, cancelled, missed)
│   ├── type (enum: new, follow_up)
│   ├── consultation_fee (decimal)
│   ├── payment_status (enum: unpaid, paid, refunded)
│   ├── payment_method (enum: cash, online, pending)
│   ├── payment_id (FK → payments.id, nullable)
│   ├── symptoms (text)
│   ├── notes (text)
│   ├── is_rated (boolean)
│   ├── queue_position (int)
│   ├── estimated_wait_time_minutes (int)
│   ├── cancelled_at (timestamp)
│   ├── cancel_reason
│   └── created_at
│
├── QUEUE_MANAGEMENT
│   ├── id (PK, UUID)
│   ├── chamber_id (FK → chambers.id)
│   ├── doctor_id (FK → doctors.id)
│   ├── date (date)
│   ├── current_serial (int)
│   ├── last_serial (int)
│   ├── status (enum: active, paused, completed)
│   ├── started_at (timestamp)
│   ├── paused_at (timestamp)
│   └── completed_at (timestamp)
│
├── PAYMENTS
│   ├── id (PK, UUID)
│   ├── appointment_id (FK → appointments.id)
│   ├── patient_id (FK → patients.id)
│   ├── transaction_id (unique)
│   ├── sslcommerz_session_id
│   ├── amount (decimal)
│   ├── currency (varchar: BDT)
│   ├── status (enum: initiated, success, failed, refunded)
│   ├── payment_method (varchar)
│   ├── gateway_response (JSON)
│   └── created_at
│
├── NOTIFICATIONS
│   ├── id (PK, UUID)
│   ├── user_id (FK → users.id)
│   ├── type (enum: appointment_confirmed, queue_update, payment_success, reminder, cancellation)
│   ├── title (varchar)
│   ├── body (text)
│   ├── data (JSON)
│   ├── is_read (boolean)
│   ├── firebase_message_id
│   └── created_at
│
├── REVIEWS
│   ├── id (PK, UUID)
│   ├── appointment_id (FK → appointments.id, unique)
│   ├── patient_id (FK → patients.id)
│   ├── doctor_id (FK → doctors.id)
│   ├── rating (int, 1-5)
│   ├── comment (text)
│   └── created_at
│
└── AUDIT_LOGS
    ├── id (PK, UUID)
    ├── user_id (FK → users.id)
    ├── action (varchar)
    ├── entity_type (varchar)
    ├── entity_id (UUID)
    ├── old_values (JSON)
    ├── new_values (JSON)
    ├── ip_address
    └── created_at
```

### 2.2 Key Relationships

- **User → Patient/Doctor/Assistant/Admin**: 1:1 polymorphic
- **Doctor → Chambers**: 1:N
- **Chamber → Assistants**: 1:N
- **Doctor → Schedules**: 1:N (per chamber)
- **Patient → Appointments**: 1:N
- **Chamber → Appointments**: 1:N
- **Appointment → Queue_Management**: N:1 (daily queue)
- **Appointment → Payment**: 1:1
- **Appointment → Review**: 1:1

### 2.3 Index Strategy

- `users(phone)` unique
- `users(email)` unique (partial, where email IS NOT NULL)
- `doctors(speciality, is_verified)` for search
- `doctors(bmdc_registration_number)` unique
- `appointments(doctor_id, appointment_date, status)` for daily queue
- `appointments(patient_id, status)` for patient history
- `appointments(token_number)` unique
- `chambers(doctor_id, is_active)`
- `queue_management(chamber_id, date)` unique
- `payments(transaction_id)` unique
- `notifications(user_id, is_read, created_at)`

---

## 3. API Architecture

### 3.1 API Design Principles

- RESTful endpoints with versioning (`/api/v1/...`)
- Consistent response envelope
- HTTP status codes for all responses
- Pagination for list endpoints
- Filtering, sorting via query parameters
- JSON request/response body

### 3.2 Standard Response Envelope

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "errors": []
}
```

### 3.3 Module Endpoints

#### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/verify-otp` | Public | Verify phone via OTP |
| POST | `/login` | Public | Login, get tokens |
| POST | `/refresh-token` | Public | Refresh access token |
| POST | `/logout` | Authenticated | Invalidate refresh token |
| POST | `/forgot-password` | Public | Request password reset |
| POST | `/reset-password` | Public | Reset password |
| GET | `/profile` | Authenticated | Get current user profile |
| PUT | `/profile` | Authenticated | Update profile |

#### Doctors (`/api/v1/doctors`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Search/list doctors |
| GET | `/:id` | Public | Get doctor details |
| GET | `/:id/schedules` | Public | Get doctor schedules |
| GET | `/:id/reviews` | Public | Get doctor reviews |
| PUT | `/:id` | Doctor | Update own profile |
| PUT | `/:id/availability` | Doctor | Toggle availability |

#### Chambers (`/api/v1/chambers`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor | Create chamber |
| GET | `/` | Public | List chambers (filterable) |
| GET | `/:id` | Public | Get chamber details |
| PUT | `/:id` | Doctor | Update chamber |
| DELETE | `/:id` | Doctor | Deactivate chamber |
| POST | `/:id/assistants` | Doctor | Assign assistant |
| DELETE | `/:id/assistants/:assistantId` | Doctor | Remove assistant |
| POST | `/:id/schedules` | Doctor | Create schedule |
| PUT | `/schedules/:scheduleId` | Doctor | Update schedule |
| DELETE | `/schedules/:scheduleId` | Doctor | Delete schedule |

#### Appointments (`/api/v1/appointments`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Patient | Book appointment |
| GET | `/` | Mixed | List appointments (role-based) |
| GET | `/:id` | Mixed | Get appointment details |
| PUT | `/:id/cancel` | Patient | Cancel appointment |
| PUT | `/:id/check-in` | Assistant | Check-in patient |
| PUT | `/:id/complete` | Doctor | Mark consultation done |
| PUT | `/:id/no-show` | Doctor | Mark patient as no-show |
| GET | `/history` | Patient | Appointment history |
| GET | `/today` | Doctor/Asst | Today's appointments |

#### Queue (`/api/v1/queue`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/:chamberId` | Public | Current queue status |
| POST | `/:chamberId/next` | Assistant | Call next patient |
| POST | `/:chamberId/pause` | Assistant | Pause queue |
| POST | `/:chamberId/resume` | Assistant | Resume queue |
| POST | `/:chamberId/reset` | Assistant | Reset queue (end of day) |
| GET | `/:chamberId/live` | Public | Get live queue state |

#### Payments (`/api/v1/payments`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/initiate` | Patient | Initiate SSLCommerz payment |
| POST | `/success/:transactionId` | Public | SSLCommerz success callback |
| POST | `/fail/:transactionId` | Public | SSLCommerz fail callback |
| POST | `/cancel/:transactionId` | Public | SSLCommerz cancel callback |
| POST | `/ipn` | Public | SSLCommerz IPN |
| GET | `/:id` | Mixed | Get payment details |

#### Notifications (`/api/v1/notifications`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Authenticated | List notifications |
| PUT | `/:id/read` | Authenticated | Mark as read |
| PUT | `/read-all` | Authenticated | Mark all as read |
| PUT | `/register-device` | Authenticated | Register FCM token |

#### Admin (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard` | Admin | Dashboard analytics |
| GET | `/users` | Admin | Manage users |
| PUT | `/doctors/:id/verify` | Admin | Verify doctor |
| GET | `/appointments` | Admin | All appointments |
| GET | `/payments` | Admin | Payment reports |
| GET | `/analytics` | Admin | System analytics |

---

## 4. Authentication Flow

### 4.1 Registration Flow

```
Client                    Server                         DB
  │                         │                            │
  │  POST /api/v1/auth/     │                            │
  │  register               │                            │
  │  {phone, password,      │                            │
  │   name, role}           │                            │
  │────────────────────────>│                            │
  │                         │───Check phone uniqueness──>│
  │                         │<───exists?────────────────│
  │                         │                            │
  │                         │───Generate OTP────────────>│
  │                         │<───Store OTP──────────────│
  │  {success: true,        │                            │
  │   message: "OTP sent"}  │                            │
  │<────────────────────────│                            │
  │                         │                            │
  │  POST /api/v1/auth/     │                            │
  │  verify-otp             │                            │
  │  {phone, otp}           │                            │
  │────────────────────────>│                            │
  │                         │───Verify OTP──────────────>│
  │                         │<───OTP valid──────────────│
  │                         │                            │
  │                         │───Create user─────────────>│
  │                         │───Create profile──────────>│
  │                         │───Generate tokens─────────│
  │  {accessToken,          │                            │
  │   refreshToken,         │                            │
  │   user}                 │                            │
  │<────────────────────────│                            │
```

### 4.2 Login Flow

```
Client                    Server                         DB
  │                         │                            │
  │  POST /api/v1/auth/     │                            │
  │  login                  │                            │
  │  {phone, password}      │                            │
  │────────────────────────>│                            │
  │                         │───Find user by phone──────>│
  │                         │<───user───────────────────│
  │                         │                            │
  │                         │───Compare password hash───│
  │                         │                            │
  │                         │───Generate accessToken────│
  │                         │  (JWT, 15min expiry)      │
  │                         │                            │
  │                         │───Generate refreshToken───│
  │                         │  (JWT, 7 day expiry)      │
  │                         │                            │
  │                         │───Store refreshToken──────>│
  │                         │  (hashed)                 │
  │                         │                            │
  │  {accessToken,          │                            │
  │   refreshToken,         │                            │
  │   user: {id, role,      │                            │
  │    name, phone, profile}│                            │
  │<────────────────────────│                            │
```

### 4.3 Token Refresh Flow

```
Client                    Server                         DB
  │                         │                            │
  │  POST /api/v1/auth/     │                            │
  │  refresh-token          │                            │
  │  {refreshToken}         │                            │
  │────────────────────────>│                            │
  │                         │───Verify JWT signature────│
  │                         │───Find stored hash────────>│
  │                         │<───match──────────────────│
  │                         │                            │
  │                         │───Generate new tokens─────│
  │                         │───Rotate refresh token────>│
  │                         │                            │
  │  {accessToken,          │                            │
  │   refreshToken}         │                            │
  │<────────────────────────│                            │
```

### 4.4 JWT Payload Structure

```json
// Access Token (15 min expiry)
{
  "sub": "user-uuid",
  "role": "doctor",
  "type": "access",
  "iat": 1700000000,
  "exp": 1700000900
}

// Refresh Token (7 day expiry)
{
  "sub": "user-uuid",
  "type": "refresh",
  "tokenId": "uuid-for-token-rotation",
  "iat": 1700000000,
  "exp": 1700600000
}
```

### 4.5 RBAC Middleware Strategy

```javascript
// Permission matrix
const permissions = {
  patient:  ['appointments:own', 'payments:own', 'profile:own'],
  assistant: ['queue:manage', 'appointments:view', 'appointments:checkin'],
  doctor:    ['profile:manage', 'chambers:manage', 'queue:control',
              'appointments:view', 'appointments:complete'],
  admin:     ['*'] // Full access
};

// Middleware chain
router.post('/appointments',
  authenticate,           // Verify JWT
  authorize('patient'),   // Role check
  validate(createAppointmentSchema), // Validation
  appointmentController.create
);
```

---

## 5. Queue Management Flow

### 5.1 Daily Queue Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                      QUEUE LIFECYCLE                             │
│                                                                  │
│  ┌─────────┐   ┌──────────┐   ┌───────────┐   ┌─────────────┐  │
│  │ QUEUE   │   │ QUEUE    │   │ QUEUE     │   │ QUEUE        │  │
│  │ INIT    │──>│ ACTIVE   │──>│ COMPLETED │──>│ ARCHIVED     │  │
│  │ (Empty) │   │ (Running)│   │ (End Day) │   │ (History)    │  │
│  └─────────┘   └──────────┘   └───────────┘   └─────────────┘  │
│       │              │              │                            │
│       │ Auto-create  │ Pause/       │ Auto-archive               │
│       │ at 12:00 AM  │ Resume       │ at 11:59 PM               │
│       │ on first     │ Supported    │                            │
│       │ appointment  │              │                            │
│       └──────────────┴──────────────┴────────────────────────────┘
│                                                                  │
│  SERIAL FLOW:                                                    │
│  ┌────────┐   ┌────────────┐   ┌──────────────┐                 │
│  │ BOOKED │──>│ CHECKED_IN │──>│ IN_CONSULT   │                 │
│  │ Serial │   │ (Arrived)  │   │ (With Doctor)│                 │
│  │ Assigned│  │            │   │              │                 │
│  └────────┘   └────────────┘   └──────┬───────┘                 │
│                                        │                         │
│                        ┌───────────────┼───────────────┐         │
│                        ▼               ▼               ▼         │
│                  ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│                  │COMPLETED │   │MISSED    │   │CANCELLED │     │
│                  │(Done)    │   │(No-show) │   │(By User) │     │
│                  └──────────┘   └──────────┘   └──────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Real-Time Queue Synchronization

```
┌────────────┐      ┌─────────────┐      ┌────────────┐
│  Patient   │      │   Server    │      │  Assistant │
│  (Mobile)  │      │ (Socket.IO) │      │  (Web App) │
└─────┬──────┘      └──────┬──────┘      └──────┬─────┘
      │                    │                     │
      │  Book Appointment  │                     │
      │────────────────────>                     │
      │                    │                     │
      │                    │──Create appointment─│
      │                    │──Emit: queue_update │
      │                    │   {chamberId,       │
      │                    │    serial: 5,       │
      │                    │    status: booked}  │
      │ <──────────────────│                     │
      │                    │                     │
      │  Join Room:        │                     │
      │  chamber_<id>      │                     │
      │────────────────────>                     │
      │                    │                      │ Call Next Patient
      │                    │<─────────────────────│
      │                    │                      │
      │                    │──Update queue state──│
      │                    │──Emit: queue_update  │
      │                    │   {currentSerial: 2, │
      │                    │    patientSerial: 5, │
      │                    │    estimatedWait: 15}│
      │  Receive Update    │                      │
      │<────────────────────│                     │
      │                    │                      │
      │                    │──Emit: next_patient  │
      │                    │   {serial: 2,        │
      │    (if serial 2)   │    chamberId,        │
      │<────────────────────│    room: "Room 2"}  │
      │                    │                      │
```

### 5.3 Queue Algorithm

```
Daily Serial Generation:
  - Serial = (Previous Day's Last Serial % 1000) + 1 for next day
  - Token = Chamber-Prefix + Serial (e.g., DHL-042)
  - On booking: assign next available serial

Queue Position Calculation:
  - position = COUNT of appointments with:
      same doctor, same date, status IN (booked, checked_in)
      AND serial < current patient's serial
  
  - estimated_wait = position × average_consultation_time

Average Consultation Time:
  - Rolling average of last 50 completed appointments
  - Updated after each consultation completion
```

---

## 6. Payment Flow

### 6.1 SSLCommerz Integration

```
Patient                  Server                    SSLCommerz
  │                        │                          │
  │  POST /payments/       │                          │
  │  initiate              │                          │
  │  {appointmentId}       │                          │
  │───────────────────────>│                          │
  │                        │──Validate appointment───│
  │                        │──Generate transactionId │
  │                        │                          │
  │                        │──POST to SSLCommerz──────>│
  │                        │  Session Init API        │
  │                        │  {total_amount,          │
  │                        │   tran_id,               │
  │                        │   success_url,           │
  │                        │   fail_url,              │
  │                        │   cancel_url,            │
  │                        │   cus_name,              │
  │                        │   cus_phone,             │
  │                        │   cus_email}             │
  │                        │                          │
  │                        │<──SessionKey, GatewayURL─│
  │  {gatewayUrl}          │                          │
  │<───────────────────────│                          │
  │                        │                          │
  │  Redirect to Gateway───│─────────────────────────>│
  │                        │                          │
  │           User completes payment on SSLCommerz    │
  │                        │                          │
  │  SSLCommerz redirects  │                          │
  │  to success_url        │                          │
  │───────────────────────>│                          │
  │                        │──Validate hash──────────│
  │                        │──Verify with SSLCommerz─>│
  │                        │  Validation API          │
  │                        │<──Verified──────────────│
  │                        │                          │
  │                        │──Update payment status───│
  │                        │──Confirm appointment────│
  │                        │──Emit queue_update──────│
  │                        │──Send push notification─│
  │                        │                          │
  │  {success: true,       │                          │
  │   appointment: {...},  │                          │
  │   queueInfo: {...}}    │                          │
  │<───────────────────────│                          │
```

### 6.2 Fee Structure

```
Consultation Fee Flow:
  - Doctor sets: consultation_fee, follow_up_fee
  - New patient: consultation_fee
  - Follow-up (within 7 days): follow_up_fee
  - Online payment: SSLCommerz (2% gateway fee)
  - On-site payment: Cash (handled by assistant)

Commission Model (Admin configurable):
  - Platform fee: X% of consultation fee
  - Doctor earnings: consultation_fee - platform_fee
  - Payout: Monthly settlement to doctor

Refund Policy:
  - Cancel 24h before: Full refund (minus gateway fee)
  - Cancel 2-24h before: 50% refund
  - Cancel < 2h before: No refund
  - Doctor cancels: Full refund
```

---

## 7. Folder Structure

### 7.1 Monorepo Structure

```
/healthcare-queue-system
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── app.js                    # Express app setup
│   │   ├── server.js                 # Entry point
│   │   ├── config/
│   │   │   ├── index.js              # Central config
│   │   │   ├── database.js           # PostgreSQL connection
│   │   │   ├── redis.js              # Redis connection
│   │   │   ├── firebase.js           # Firebase init
│   │   │   └── sslcommerz.js         # SSLCommerz config
│   │   ├── modules/                  # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.validation.js
│   │   │   │   └── auth.utils.js
│   │   │   ├── doctor/
│   │   │   ├── chamber/
│   │   │   ├── appointment/
│   │   │   ├── queue/
│   │   │   ├── payment/
│   │   │   ├── notification/
│   │   │   └── admin/
│   │   ├── middleware/
│   │   │   ├── authenticate.js       # JWT verification
│   │   │   ├── authorize.js          # Role check
│   │   │   ├── validate.js           # Request validation
│   │   │   ├── errorHandler.js       # Global error handler
│   │   │   ├── rateLimiter.js        # Rate limiting
│   │   │   └── asyncHandler.js       # Async wrapper
│   │   ├── database/
│   │   │   ├── migrations/           # SQL migration files
│   │   │   ├── seeds/               # Seed data
│   │   │   └── queries/             # Raw SQL queries
│   │   ├── socket/
│   │   │   ├── index.js             # Socket.IO setup
│   │   │   ├── queueHandler.js      # Queue events
│   │   │   └── authMiddleware.js    # Socket auth
│   │   ├── utils/
│   │   │   ├── jwt.js               # JWT helpers
│   │   │   ├── password.js          # Hashing helpers
│   │   │   ├── response.js          # Response formatter
│   │   │   ├── logger.js            # Winston logger
│   │   │   └── helpers.js           # Misc helpers
│   │   └── constants/
│   │       ├── roles.js
│   │       ├── status.js
│   │       └── errors.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── docker/
│   │   └── Dockerfile
│   ├── .env.example
│   ├── .eslintrc.js
│   └── package.json
│
├── mobile/                           # React Native App
│   ├── src/
│   │   ├── navigation/
│   │   │   ├── AppNavigator.js
│   │   │   ├── AuthNavigator.js
│   │   │   ├── PatientNavigator.js
│   │   │   ├── DoctorNavigator.js
│   │   │   └── AssistantNavigator.js
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.js
│   │   │   │   ├── RegisterScreen.js
│   │   │   │   ├── OTPScreen.js
│   │   │   │   └── ForgotPasswordScreen.js
│   │   │   ├── patient/
│   │   │   ├── doctor/
│   │   │   ├── assistant/
│   │   │   └── common/
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── auth.service.js
│   │   │   ├── appointment.service.js
│   │   │   └── socket.service.js
│   │   ├── store/                    # State management
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── assets/
│   ├── android/
│   ├── ios/
│   ├── .env.example
│   └── package.json
│
├── web/                              # Next.js Web Application
│   ├── src/
│   │   ├── app/                     # App Router
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── doctors/
│   │   │   └── appointments/
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── utils.js
│   │   ├── hooks/
│   │   ├── store/
│   │   └── styles/
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.web
│   └── nginx/
│       └── default.conf
│
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── seed.sh
│
├── docs/
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## 8. Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20 LTS | Server-side runtime |
| **Backend Framework** | Express.js | 4.x | REST API framework |
| **Database** | PostgreSQL | 16 | Primary data store |
| **Cache** | Redis | 7.x | Session/cache/queue state |
| **ORM/Query** | node-postgres (pg) | 8.x | Raw SQL with prepared statements |
| **Auth** | jsonwebtoken | 9.x | JWT generation/verification |
| **Real-time** | Socket.IO | 4.x | Live queue updates |
| **Password** | bcrypt | 5.x | Password hashing |
| **Validation** | Joi | 17.x | Request validation |
| **Logging** | Winston | 3.x | Structured logging |
| **Payments** | SSLCommerz-node | latest | BD payment gateway |
| **Push Notifications** | firebase-admin | 12.x | FCM push notifications |
| **Mobile** | React Native | 0.73+ | Cross-platform mobile app |
| **Web** | Next.js | 14+ | SSR web application |
| **Container** | Docker | latest | Containerization |
| **Testing** | Jest + Supertest | latest | Unit & integration tests |

---

## 9. Security Considerations

- **Password Storage**: bcrypt with salt rounds = 12
- **JWT Storage**: Access token (memory/secure storage), Refresh token (httpOnly cookie + DB)
- **Rate Limiting**: express-rate-limit (100 req/15min for auth, 1000 req/15min for general)
- **SQL Injection**: Parameterized queries via pg library
- **XSS**: Input sanitization, Helmet.js headers
- **CORS**: Whitelist specific origins
- **SSL/TLS**: HTTPS enforced in production
- **Payment**: SSLCommerz hash validation, IPN verification
- **Audit Trail**: All critical operations logged in audit_logs table

---

## 10. Scalability & Performance

- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: pg-pool for database connections
- **Redis Caching**: Cache frequently accessed doctor data, chamber lists
- **Queue State**: In-memory + Redis for real-time queue state
- **Load Balancing**: Nginx round-robin for horizontal scaling
- **Database Sharding**: Future - by region/city
- **CDN**: Static assets via CDN in production

---

*Document Version: 1.0*
*Last Updated: June 2026*
