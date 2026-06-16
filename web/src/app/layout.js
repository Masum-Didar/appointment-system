import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'HealthQueue - Healthcare Appointment System',
  description: 'Book appointments with doctors and manage live queues',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="flex max-w-7xl mx-auto">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
