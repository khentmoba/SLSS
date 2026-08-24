# Sanco Land Surveying Services

Client portal and staff operations for requesting, quoting, scheduling, and tracking land surveying services in Agasan del Norte/Sur. Single context covering client and staff workflows.

## Language

### Core Actors & Assets

**Client**:
A person who requests surveying services, identified by phone number (OTP). One Client owns one or more Properties.
_Avoid_: Customer, user, account, buyer

**Property**:
A durable parcel of land owned or represented by a Client, identified by location, Lot/Title information, and address label (e.g., "Lot 1234 – Cabadbaran"). Properties persist across multiple service engagements.
_Avoid_: Lot, parcel, asset, land

**Staff**:
A Sanco team member who operates the Staff Admin Portal to triage requests, issue quotations, and drive Projects forward. For MVP there are two Staff (including one Estimator); all Staff share the same permissions.
_Avoid_: Admin, employee, surveyor (surveyor is a future specialized Staff role)

### Commercial Lifecycle

**Quotation**:
A priced offer issued by the Estimator during a Project's `QUOTATION` status, with line items (Survey Fee, Other Fees, Total), validity period, and status (Sent / Accepted / Clarification Requested / Rejected / Expired). Versioned per Project (v1, v2...).
_Avoid_: Estimate, proposal, billing, invoice

**Project**:
The end-to-end engagement from initial request through delivery, tied to one Property and one Survey Type. A Project is created at `CLIENT REQUEST` (including guest submissions via phone; auto-claimed on OTP registration, and staff intake for walk-in/phone/FB leads) and its `Project Status` advances through the full 8-step pipeline.
_Avoid_: Job, order, task, service, Quotation Request (deprecated — every inquiry is a Project at early Status)

**Survey Type**:
The category of surveying work requested (e.g., Land/Property Survey, Relocation, Subdivision, Consolidation, Topographic, Boundary Verification, Other).
_Avoid_: Service, survey category

### Execution

**Project Status**:
The 8-step delivery pipeline: `CLIENT REQUEST → DOCUMENT CHECK → QUOTATION → PAYMENT / CONFIRMATION → SITE SURVEY → PROCESSING → DOCUMENTATION → COMPLETED`. Every Project carries this Status; pre-quotation steps (DOCUMENT CHECK, QUOTATION) are part of the Project, not separate from it.
_Avoid_: State, phase, stage (use Status)

**Payment Confirmation**:
The Client's acceptance of a Quotation and commitment to proceed. For MVP this is a manual confirmation (Accept button); in future it will be completed by online payment (deposit/full) via GCash/Maya/card. The Project cannot advance to `SITE SURVEY` until Payment Confirmation is recorded.
_Avoid_: Payment, checkout, remittance (use Payment Confirmation for the status-gating event, regardless of channel)

**Appointment**:
A scheduled on-site engagement for a Project's `SITE SURVEY` step, with a date, time, site location, and contact person. Requires Staff confirmation to become binding.
_Avoid_: Booking, schedule, meeting

**Document**:
A supporting file uploaded by a Client or Staff for a Property or Project (e.g., TCT/OCT, Tax Declaration, Deed of Sale, Lot Plan, Valid ID). Each Document has a requirement per Survey Type (required/optional) and a state (`MISSING → UPLOADED → VERIFIED / REJECTED`); `DOCUMENT CHECK` cannot advance to `QUOTATION` until required Documents are `VERIFIED` (or Staff overrides with reason).
_Avoid_: File, attachment, paper, requirement

**Supporting Record**:
The authoritative technical output produced by Staff (AutoCAD drawing / lot plan). Stored externally today (AutoCAD file + Google Drive/paper); referenced by the portal but not generated inside it for MVP.
_Avoid_: Plan, drawing, technical file (use Supporting Record when referring to the Sanco-produced deliverable)
