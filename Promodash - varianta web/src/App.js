import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResendVerification from "./pages/auth/ResendVerification"

import Account from "./pages/tabs/Account"
import Cashback from "./pages/tabs/Cashback"
import CashbackNot from "./pages/tabs/CashbackNot"
import CashbackPending from "./pages/tabs/CashbackPending"
import Codes from "./pages/tabs/Codes"
import Conditions from "./pages/tabs/Conditions"
import Contact from "./pages/tabs/Contact"
import CreateRequest from "./pages/tabs/CreateRequest"
import Help from "./pages/tabs/Help"
import Index from "./pages/tabs/Index"
import Invite from "./pages/tabs/Invite"
import MyRequests from "./pages/tabs/MyRequests"
import PrivacyPolicy from "./pages/tabs/PrivacyPolicy"
import RequestDetails from "./pages/tabs/RequestDetails"
import RequestIssue from "./pages/tabs/RequestIssue"
import Settings from "./pages/tabs/Settings"
import StoreDetails from "./pages/tabs/StoreDetails"
import TermsOfUse from "./pages/tabs/TermsOfUse"
import Withdrawal from "./pages/tabs/Withdrawal"
import WithdrawCollected from "./pages/tabs/WithdrawCollected"

import { ThemeProvider } from "./context/ThemeContext"
import { UserProvider } from "./context/UserContext"
import { LanguageProvider } from "./context/LanguageContext"
import { FavoritesProvider } from "./context/FavoritesContext"

import "./i18n"

import ProtectedRoute from "./routes/ProtectedRoute"
import GuestRoute from "./routes/GuestRoute"

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <BrowserRouter>
            <Routes>
              {/* GUEST Routes */}
              <Route path="/auth/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/auth/signup" element={<GuestRoute><Signup /></GuestRoute>} />
              <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="/auth/resend-verification" element={<GuestRoute><ResendVerification /></GuestRoute>} />

              {/* PROTECTED Routes */}
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/cashback" element={<ProtectedRoute><Cashback /></ProtectedRoute>} />
              <Route path="/cashbacknot" element={<ProtectedRoute><CashbackNot /></ProtectedRoute>} />
              <Route path="/cashbackpending" element={<ProtectedRoute><CashbackPending /></ProtectedRoute>} />
              <Route path="/codes" element={<ProtectedRoute><Codes /></ProtectedRoute>} />
              <Route path="/conditions" element={<ProtectedRoute><Conditions /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path="/createrequest" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
              <Route path="/index" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/invite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
              <Route path="/myrequests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
              <Route path="/privacypolicy" element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
              <Route path="/requestdetails" element={<ProtectedRoute><RequestDetails /></ProtectedRoute>} />
              <Route path="/requestissue" element={<ProtectedRoute><RequestIssue /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/storedetails" element={<ProtectedRoute><StoreDetails /></ProtectedRoute>} />
              <Route path="/termsofuse" element={<ProtectedRoute><TermsOfUse /></ProtectedRoute>} />
              <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
              <Route path="/withdrawcollected" element={<ProtectedRoute><WithdrawCollected /></ProtectedRoute>} />
            </Routes>

            </BrowserRouter>
          </FavoritesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  )
}

export default App
