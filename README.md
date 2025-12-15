# 📧 Bharat Mail

**Bharat Mail** is a modern email client web application inspired by Gmail, designed with a clean UI and smooth user experience.  
The project demonstrates frontend engineering, cloud deployment, and production-ready configuration.

🌐 **Live Demo:** https://bharat-mail.vercel.app  
📦 **GitHub Repo:** https://github.com/Yougeshkumar/BharatMail

---

## 🚀 Features

- 📬 Gmail-inspired inbox UI
- 📝 Compose and read emails
- 📂 Sidebar navigation (Inbox, Sent, Drafts, Spam)
- 🌙 Light / Dark mode
- ⚡ Fast and responsive UI
- ☁️ Deployed on Vercel with CI/CD

> ⚠️ *AI smart replies are currently mocked in the frontend.  
> In production, AI APIs should be handled via a secure backend.*

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (CDN)
- **Deployment:** Vercel
- **Version Control:** Git & GitHub

---

## 🧱 Project Structure
## 🧱 Project Structure

```bash
bharat-mail/
├── components/
│   ├── ComposeModal.tsx
│   ├── EmailList.tsx
│   ├── EmailListItem.tsx
│   ├── EmailView.tsx
│   ├── Header.tsx
│   ├── Onboarding.tsx
│   └── Sidebar.tsx
│
├── services/
│   ├── emailService.ts
│   └── geminiService.ts
│
├── App.tsx
├── index.tsx
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```



## ⚙️ Local Setup

Follow these steps to run the project locally:

### 1. Clone the repository
```bash
git clone https://github.com/Yougeshkumar/BharatMail.git
cd BharatMail

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
### 4. Open the app in your browser
http://localhost:5173

---
















