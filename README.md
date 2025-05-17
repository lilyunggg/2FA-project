# 2FA-project

This is a simple 2FA app that can be integrated into various types of login systems.

Two-factor authentication (2FA) adds an extra layer of security to user logins by requiring not only a password but also a second factor—typically a code sent to the user's phone. 2FA can also be used for passwordless login, where the user authenticates using only a code sent to their device, eliminating the need for a traditional password. By requiring something the user knows (a password) or something they have (their phone), 2FA significantly reduces the risk of unauthorized access—even if a password is compromised, an attacker cannot log in without the second factor. This project demonstrates a simple full-stack 2FA app using:

- **React** for the frontend user interface
- **Express.js** for the backend server
- **Twilio Verify** for sending and verifying SMS codes
- **HTTPS** for secure communication

The app guides users through entering their phone number, receiving a verification code via SMS, and confirming their identity. The SMS-verification has a 2 minute time limit which is shown by the light blue ring around the lock.

## Prerequisites
- Twilio account with a Verify Service ([Twilio Console](https://www.twilio.com/console/verify/services))
- OpenSSL (generating certificates for HTTPS)
---

## Creating a Twilio Verify Service

To use Twilio Verify for sending and checking SMS codes, you need to create a Verify Service in your Twilio Console:

1. Log in or Sign up to your [Twilio Console](https://www.twilio.com/console/verify/services).
2. Click **Create new Service**.
3. Enter a friendly name (e.g., "2FA Demo") and choose **Verification** as the service type.
4. Click **Create**.
5. Copy the **Service SID** (it starts with `VA...`).  
   You’ll need this for your `.env` file as `TWILIO_VERIFY_SERVICE_SID`.

For more details, see [Twilio’s Verify Quickstart](https://www.twilio.com/docs/verify/api).


## Installing OpenSSL

### Windows

1. Download the latest OpenSSL installer for Windows from [https://slproweb.com/products/Win32OpenSSL.html](https://slproweb.com/products/Win32OpenSSL.html).
2. Run the installer and follow the prompts. Choose the default options unless you have specific requirements.
3. After installation, add the OpenSSL `bin` directory (e.g., `C:\Program Files\OpenSSL-Win64\bin`) to your system `PATH` environment variable.
4. Open a new Command Prompt and verify installation:
   ```sh
   openssl version
   ```

### Linux (Debian/Ubuntu)

1. Update your package list:
   ```sh
   sudo apt update
   ```
2. Install OpenSSL:
   ```sh
   sudo apt install openssl
   ```
3. Verify installation:
   ```sh
   openssl version
   ```


## Setup

### 1. Clone the repository

```sh
git clone <repo-url>
cd 2FA-project
```

### 2. Install backend dependencies

```sh
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
PORT=3000
```

### 4. Install frontend dependencies

```sh
cd frontend
npm install
```

### 5. Configure HTTPS certificates

Generate self-signed certificates (for local development only):

```sh
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
```

Place `key.pem` and `cert.pem` in the project root.


## Running the App

### 1. Start the backend

From the project root:

```sh
npm start
```

The backend will run on [https://localhost:3000](https://localhost:3000).

### 2. Start the frontend

In a new terminal, from the `frontend` directory:

```sh
npm run dev
```

The frontend will run on [https://localhost:5173](https://localhost:5173).


## Usage

1. Enter your phone number in international format (e.g., `+1234567890`) and click **Verify**.
2. Enter the verification code you receive via SMS.
3. If successful, the lock icon will animate to "unlocked".


## Testing

Backend tests use Vitest and Supertest.

```sh
npm test
```


## Secure programming principles

This app includes several security features and best practices:

- **Sensitive Files**:  
  The `.env` file stores your Twilio credentials and other secrets to keep them out of the wrong hands.  
  The SSL certificate files (`key.pem`, `cert.pem`) are also highly sensitive, as they secure communications between your frontend and backend.  
  These files give access to your accounts and secure communications, so they must be kept private and never shared or committed to your repository.  
  Always add them to your `.gitignore` file to prevent accidental exposure.

- **HTTPS Usage**:  
  The backend supports HTTPS using SSL certificates (`key.pem`, `cert.pem`).  
  HTTPS encrypts all data sent between your frontend and backend, protecting sensitive information like phone numbers and verification codes from being intercepted.  
  For local development, you can use self-signed certificates, but for production always use certificates from a trusted Certificate Authority.

- **Input Validation**: All user input (phone numbers, codes) is validated and sanitized on both frontend and backend using [validator.js](https://github.com/validatorjs/validator.js) to prevent malformed data and injection attacks.

- **Rate Limiting**: The backend uses `express-rate-limit` to restrict the number of API requests per IP, mitigating brute-force and abuse attempts.

- **CORS Policy**: Cross-Origin Resource Sharing (CORS) is configured to only allow requests from the trusted frontend origin during development, reducing the risk of CSRF and unwanted cross-origin requests.

- **Error Handling**: The backend avoids leaking sensitive error details to clients, returning generic error messages for internal failures.

- **Dependency Management**: Uses up-to-date, well-maintained libraries for core functionality and security.

**Important:**  
Add `.env`, `key.pem`, and `cert.pem` to your `.gitignore` file to ensure they are not included in your repository.


## ⚠️ HTTPS & Browser Security Warning

**Disclaimer:**  
When running this app locally with self-signed HTTPS certificates (`key.pem`, `cert.pem`), your browser—including Chrome, Firefox, Edge, and Safari—will likely display a warning such as "This site is not secure" or "Your connection is not private." This is a standard browser response to self-signed certificates and does **not** mean the app is trying to steal your information or is unsafe to use for local development.

- **Why does this happen?**  
  Self-signed certificates are not issued by a recognized Certificate Authority (CA), so browsers cannot verify their authenticity. This is expected and safe for local development environments.

- **How to proceed:**  
  - In most browsers, you can click "Advanced" or "Details" and then "Proceed" or "Accept the Risk" to continue to your local site.
  - This warning will not appear in production if you use a certificate from a trusted CA (such as Let's Encrypt).

- **Rest assured:**  
  This warning is not caused by any malicious behavior in this app. It is simply a result of using self-signed certificates for development. Your information is not being stolen or intercepted by this project.

- **Do not use self-signed certificates in production.**  
  For public deployments, always use certificates from a trusted CA to ensure user security and avoid browser warnings.


## License
MIT

---

## Credits

- [Twilio Verify](https://www.twilio.com/docs/verify)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [validator.js](https://github.com/validatorjs/validator.js)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Vitest](https://vitest.dev/)
- [react-circular-progressbar](https://www.npmjs.com/package/react-circular-progressbar)

## Presentation slides
Tuni signup to office required.

[Presentation](https://tuni-my.sharepoint.com/:p:/g/personal/roope_kallinen_tuni_fi/Eb-kezo_Fd9KraQXUu9DcSMBoUIIoqG8K2qwyntM8HgiuQ?e=PVm7zu)

## Usage of AI
AI was used extensively to create this project. It was used to plan, document and to implement the code throughout the project.