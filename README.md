# CertiChain: Generate Verifiable Certificates
### Secure • Tamper-Proof • Instantly Verifiable

## Live Demo: 
https://certi-chain-project.vercel.app/

## Overview
CertiChain is a full-stack web application designed to eliminate certificate fraud through secure issuance and instant verification. It leverages cryptographic hashing and QR codes to ensure authenticity, integrity, and fast validation of digital certificates.
The system provides a reliable way for organizations to issue certificates and for users or third parties to verify them without manual intervention.

## Key Features
1. Authentication and Authorization
2. Secure user registration and login using JWT
3. Role-based access control:
  Admin: Generate and manage certificates
  User: Verify certificates
4. Password encryption using bcrypt

## Certificate Generation (Admin)
1. Multiple customizable certificate templates
2. Unique certificate ID format (e.g., CERT-XXXXXX)
3. SHA-256 hash generation for tamper detection
4. Embedded QR code for quick verification
5. Print-ready certificate output

## Certificate Verification
1. Manual verification using certificate ID
2. QR code scanning using camera
3. Instant verification results: Valid / Tampered / Not Found / Revoked

## Admin Dashboard
1. View all issued certificates
2. Revoke certificates when necessary
3. Monitor certificate status (active / revoked)

## User Experience
1. Responsive design for mobile and desktop
2. Single-page application behavior
3. Smooth navigation and interaction

## Problem Statement
Certificate fraud is a widespread issue:
Fake certificates can be easily created
Verification processes are slow and manual
Lack of a universal validation system

CertiChain addresses these problems by providing a secure, fast, and automated verification system using cryptographic techniques.

## How It Works
1. Admin generates a certificate
2. System creates: Unique Certificate ID, SHA-256 hash, QR Code
3. User verifies certificate by: Entering ID manually, or Scanning QR code
4. System recomputes hash and compares
5. Displays verification result instantly

## Tech Stack
### Frontend
1. HTML5
2. CSS3
3. JavaScript
### Backend
1. Node.js
2. Express.js
### Database
1. MongoDB with Mongoose
### Security
1. JWT authentication
2. bcrypt password hashing
3. SHA-256 cryptographic hashing
### QR Integration
1. QRious (QR generation)
2. Html5-QrCode (QR scanning)

## Demo Flow
1. Register as Admin
2. Generate a certificate
3. Copy Certificate ID
4. Verify manually
5. Scan QR code
6. Revoke certificate
7. Verify again (shows revoked status)

## Security Highlights
1. Passwords securely hashed using bcrypt
2. Token-based authentication using JWT
3. Certificate integrity ensured via SHA-256
4. Revocation mechanism to invalidate certificates
5. Input validation to prevent misuse

## Future Improvements
1. Blockchain integration for on-chain hash storage
2. NFT-based certificates
3. Multi-organization support
4. Public API for third-party verification

## Contact
Email: tyv912005@gmail.com
GitHub: https://github.com/theyashvermaa
