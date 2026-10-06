import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JournalProvider } from './context/JournalContext';

import { TopHeader } from './components/layout/TopHeader';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { SubmitModal } from './components/common/SubmitModal';
import { PDFViewerModal } from './components/common/PDFViewerModal';
import { SearchModal } from './components/common/SearchModal';
import { NewsflashBanner } from './components/common/NewsflashBanner';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { EditorialBoard } from './pages/EditorialBoard';
import { ForAuthors } from './pages/ForAuthors';
import { CurrentIssue } from './pages/CurrentIssue';
import { Archives } from './pages/Archives';
import { ArticleDetail } from './pages/ArticleDetail';
import { ResearchAreas } from './pages/ResearchAreas';
import { PublicationEthics } from './pages/PublicationEthics';
import { Indexing } from './pages/Indexing';
import { Contact } from './pages/Contact';
import { APC } from './pages/APC';
import { Copyright } from './pages/Copyright';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Refunds } from './pages/Refunds';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { APCPayment } from './pages/APCPayment';
import { APCPaymentSuccess } from './pages/APCPaymentSuccess';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { Theses } from './pages/Theses';
import { Conferences } from './pages/Conferences';
import { SubmitPaper } from './pages/SubmitPaper';
import { LatestPapers } from './pages/LatestPapers';
import { ScrollToTop } from './components/common/ScrollToTop';

// Layout wrapper for Public pages
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-amber-100 selection:text-amber-900">
    <TopHeader />
    <Navbar />
    <NewsflashBanner />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
    <SubmitModal />
    <PDFViewerModal />
    <SearchModal />
  </div>
);

export default function App() {
  return (
    <JournalProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/editorial-board" element={<PublicLayout><EditorialBoard /></PublicLayout>} />
          <Route path="/for-authors" element={<PublicLayout><ForAuthors /></PublicLayout>} />
          <Route path="/published-papers" element={<PublicLayout><Archives /></PublicLayout>} />
          <Route path="/latest-papers" element={<PublicLayout><LatestPapers /></PublicLayout>} />
          <Route path="/current-issue" element={<PublicLayout><CurrentIssue /></PublicLayout>} />
          <Route path="/archives" element={<PublicLayout><Archives /></PublicLayout>} />
          <Route path="/submit-paper" element={<PublicLayout><SubmitPaper /></PublicLayout>} />
          <Route path="/article/:id" element={<PublicLayout><ArticleDetail /></PublicLayout>} />
          <Route path="/research-areas" element={<PublicLayout><ResearchAreas /></PublicLayout>} />
          <Route path="/publication-ethics" element={<PublicLayout><PublicationEthics /></PublicLayout>} />
          <Route path="/indexing" element={<PublicLayout><Indexing /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/apc" element={<PublicLayout><APC /></PublicLayout>} />
          <Route path="/copyright" element={<PublicLayout><Copyright /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
          <Route path="/refunds" element={<PublicLayout><Refunds /></PublicLayout>} />
          <Route path="/theses" element={<PublicLayout><Theses /></PublicLayout>} />
          <Route path="/conferences" element={<PublicLayout><Conferences /></PublicLayout>} />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment/cancelled" element={<PaymentFailed />} />
          <Route path="/payment/demo-success" element={<PaymentSuccess />} />

          {/* APC Payment Routes */}
          <Route path="/apc-payment" element={<PublicLayout><APCPayment /></PublicLayout>} />
          <Route path="/apc-payment/success" element={<PublicLayout><APCPaymentSuccess /></PublicLayout>} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </JournalProvider>
  );
}
