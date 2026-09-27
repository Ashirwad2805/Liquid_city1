import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, getDashboardPath } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { Check, Users, Calendar, Briefcase, ShieldCheck, ArrowLeft, Upload, AlertCircle } from 'lucide-react';

type Role = 'organizer' | 'partner' | 'visitor' | 'admin';

const ADMIN_EMAILS = [
  'ashirwad@admin.com',
  'shubham@admin.com',
  'saif@admin.com',
  'neelaj@admin.com',
];

interface RoleCard {
  role: Role;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'organizer',
    label: 'Organizer',
    subtitle: 'Manage events & crowds',
    description: 'Manage venues, events and crowd operations',
    icon: <Calendar size={28} className="text-black" />,
  },
  {
    role: 'partner',
    label: 'Partner',
    subtitle: 'Restaurants, Hotels & Services',
    description: 'Manage capacity, offers and visitor arrivals',
    icon: <Briefcase size={28} className="text-black" />,
  },
  {
    role: 'visitor',
    label: 'Visitor',
    subtitle: 'Explore city & redeem offers',
    description: 'Discover events, reserve and access venues',
    icon: <Users size={28} className="text-black" />,
  },
  {
    role: 'admin',
    label: 'Admin',
    subtitle: 'System Control & Analytics',
    description: 'System admin page access & live monitoring',
    icon: <ShieldCheck size={28} className="text-black" />,
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State management
  const [selectedRole, setSelectedRole] = useState<Role>('visitor');
  const [step, setStep] = useState<'role' | 'form'>('role');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [partnerType, setPartnerType] = useState('restaurant');
  const [documentType, setDocumentType] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DON'T SAVE DATA ON SIGN-UP PAGE: Clear all fields on mount
  useEffect(() => {
    setFullName('');
    setEmail('');
    setPhone('');
    setLicenseId('');
    setDocumentFile(null);
    setDocumentFileName('');
    setBusinessName('');
    setBusinessAddress('');
    setPartnerType('restaurant');
    setDocumentType('');
    setPassword('');
    setError(null);
    setStep('role');
    setSelectedRole('visitor');
  }, []);

  // File Upload Handler with Max 10MB Check
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Document photo size exceeds the maximum limit of 10 MB. Please upload a smaller file.');
        setDocumentFile(null);
        setDocumentFileName('');
        return;
      }
      setDocumentFile(file);
      setDocumentFileName(file.name);
    }
  };

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 600));

      // ADMIN CHECK
      if (selectedRole === 'admin') {
        const cleanEmail = email.trim().toLowerCase();
        if (!ADMIN_EMAILS.includes(cleanEmail)) {
          setError(
            'Invalid Admin Email. Allowed Admin emails are: ashirwad@admin.com, shubham@admin.com, saif@admin.com, neelaj@admin.com'
          );
          setLoading(false);
          return;
        }
        if (password !== 'adminlogin') {
          setError('Invalid Admin Password. Password for all admin accounts must be: adminlogin');
          setLoading(false);
          return;
        }

        const user = {
          id: `admin_${Date.now()}`,
          email: cleanEmail,
          name: cleanEmail.split('@')[0].toUpperCase() + ' (Admin)',
          role: 'admin' as UserRole,
        };
        login(user, 'admin-demo-token');
        navigate(getDashboardPath('admin'));
        return;
      }

      // ORGANIZER CHECK
      if (selectedRole === 'organizer') {
        if (!licenseId.trim()) {
          setError('User License ID is required for Organizer registration.');
          setLoading(false);
          return;
        }
        if (!documentFile) {
          setError('Document photo (Max 10 MB) is required for Organizer verification.');
          setLoading(false);
          return;
        }
      }

      // PARTNER CHECK
      if (selectedRole === 'partner') {
        if (!licenseId.trim()) {
          setError('User Registration / License ID is required for Partner registration.');
          setLoading(false);
          return;
        }
        if (!documentFile) {
          setError('Document photo (Max 10 MB) is required for Partner verification.');
          setLoading(false);
          return;
        }
      }

      // CREATE USER OBJECT
      const newUser = {
        id: `u_${Date.now()}`,
        email,
        name: fullName || email.split('@')[0],
        role: selectedRole as UserRole,
        partnerType:
          selectedRole === 'partner'
            ? (partnerType as 'restaurant' | 'hotel' | 'transport')
            : undefined,
        phone,
        licenseId: selectedRole !== 'visitor' ? licenseId : undefined,
      };

      login(newUser, 'demo-token');
      navigate(getDashboardPath(selectedRole as UserRole));
    } catch {
      setError('Could not process registration. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5CD] text-black flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-black selection:text-[#F5F5CD]">
      {/* Brand Header Bar */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 mb-6 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-[#F5F5CD] font-black text-sm tracking-wider border-2 border-black">
            LC
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-black uppercase">LiquidCity</span>
            <p className="text-[11px] font-bold text-stone-700">Smarter Crowds. Better Events.</p>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-black text-black hover:underline flex items-center gap-1 bg-[#E2E2A4] px-4 py-2 rounded-xl border-2 border-black uppercase"
        >
          <ArrowLeft size={14} /> Back to Sign in
        </Link>
      </div>

      <div className="max-w-4xl w-full mx-auto my-auto py-4">
        {step === 'role' ? (
          /* STEP 1: ROLE SELECTION */
          <div className="space-y-8 animate-fade-in text-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase">
                Create your LiquidCity account
              </h1>
              <p className="text-stone-800 text-xs font-bold uppercase tracking-wider mt-2">
                Choose how you will use LiquidCity
              </p>
            </div>

            <div className="text-left max-w-3xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-black mb-4 block">
                SELECT YOUR ROLE
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {ROLE_CARDS.filter((r) => r.role !== 'admin').map((card) => {
                  const isSelected = selectedRole === card.role;
                  return (
                    <div
                      key={card.role}
                      onClick={() => setSelectedRole(card.role)}
                      className={`relative flex flex-col justify-between p-6 rounded-3xl border-2 border-black cursor-pointer transition-all shadow-md ${
                        isSelected
                          ? 'bg-black text-[#F5F5CD]'
                          : 'bg-[#E2E2A4] hover:bg-[#D4D48A] text-black'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-black ${
                              isSelected ? 'bg-[#F5F5CD] text-black' : 'bg-[#F5F5CD] text-black'
                            }`}
                          >
                            {card.icon}
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#F5F5CD] text-black'
                                : 'bg-[#FAFAD9]'
                            }`}
                          >
                            {isSelected && <Check size={14} className="text-black font-black" />}
                          </div>
                        </div>

                        <div>
                          <h3
                            className={`text-xl font-black uppercase ${
                              isSelected ? 'text-[#F5F5CD]' : 'text-black'
                            }`}
                          >
                            {card.label}
                          </h3>
                          <p
                            className={`text-xs font-bold mt-0.5 ${
                              isSelected ? 'text-stone-300' : 'text-stone-700'
                            }`}
                          >
                            {card.subtitle}
                          </p>
                          <p
                            className={`text-xs mt-2 leading-relaxed font-semibold ${
                              isSelected ? 'text-stone-300' : 'text-stone-800'
                            }`}
                          >
                            {card.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(card.role);
                          setStep('form');
                        }}
                        className={`mt-6 w-full py-3 px-4 rounded-2xl font-black text-xs transition-colors border-2 border-black uppercase shadow-sm ${
                          isSelected
                            ? 'bg-[#F5F5CD] text-black hover:bg-white'
                            : 'bg-black text-[#F5F5CD] hover:bg-stone-800'
                        }`}
                      >
                        Select {card.label}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Admin Access Box */}
              <div className="mt-6 bg-[#E2E2A4] border-2 border-black rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black text-[#F5F5CD] flex items-center justify-center shrink-0 border-2 border-black">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-black uppercase">Administrator Portal Access</h4>
                    <p className="text-xs font-bold text-stone-800">
                      Sign in with official admin credentials to access system telemetry & crowd control.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setStep('form');
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-black hover:bg-stone-800 text-[#F5F5CD] font-black text-xs border-2 border-black uppercase whitespace-nowrap shadow-sm"
                >
                  Admin Login Page
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                  Select one role to continue
                </p>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="py-3.5 px-12 rounded-2xl bg-black hover:bg-stone-800 text-[#F5F5CD] font-black text-sm border-2 border-black shadow-md transition-all uppercase"
                >
                  Continue with {selectedRole.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: FORM BASED ON SELECTED ROLE */
          <div className="max-w-2xl mx-auto bg-[#E2E2A4] rounded-3xl border-2 border-black p-6 md:p-10 shadow-xl animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#F5F5CD] px-3 py-1 rounded-full border border-black">
                  {selectedRole.toUpperCase()} REGISTRATION
                </span>
                <h2 className="text-2xl font-black text-black uppercase mt-2">
                  {selectedRole === 'visitor'
                    ? 'Visitor Account Details'
                    : selectedRole === 'partner'
                    ? 'Partner Account Details'
                    : selectedRole === 'organizer'
                    ? 'Organizer Account Details'
                    : 'Admin System Login'}
                </h2>
                <p className="text-xs font-bold text-stone-800 mt-1">
                  {selectedRole === 'visitor'
                    ? 'Create your account to discover live capacity and available city options.'
                    : selectedRole === 'partner'
                    ? 'Tell us about your business and verify your partner identity.'
                    : selectedRole === 'organizer'
                    ? 'Submit organizer verification & license credentials.'
                    : 'Sign in to access system control, simulation, and crowd management.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('role');
                  setError(null);
                }}
                className="text-xs font-black text-black bg-[#F5F5CD] border-2 border-black px-3 py-1.5 rounded-xl uppercase hover:bg-black hover:text-[#F5F5CD]"
              >
                Change Role
              </button>
            </div>

            {error && (
              <div className="p-4 bg-[#F5F5CD] border-2 border-black rounded-2xl text-xs text-black font-bold flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 text-black mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ADMIN FORM */}
              {selectedRole === 'admin' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-black uppercase tracking-wider mb-1 block">
                      Admin Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F5F5CD] border-2 border-black text-sm text-black placeholder-stone-600 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="e.g. ashirwad@admin.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-black uppercase tracking-wider mb-1 block">
                      Admin Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F5F5CD] border-2 border-black text-sm text-black placeholder-stone-600 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="adminlogin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : selectedRole === 'visitor' ? (
                /* VISITOR FORM */
                <div className="space-y-4">
                  <div className="bg-[#F5F5CD] p-5 rounded-2xl border-2 border-black space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block border-b border-black pb-2">
                      VISITOR DETAILS
                    </span>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <p className="text-[11px] text-stone-800 font-bold">
                      Only these three details are required to create your visitor account. No business or document verification required.
                    </p>
                  </div>
                </div>
              ) : selectedRole === 'partner' ? (
                /* PARTNER FORM */
                <div className="space-y-5">
                  <div className="bg-[#F5F5CD] p-5 rounded-2xl border-2 border-black space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block border-b border-black pb-2">
                      BUSINESS DETAILS
                    </span>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Business Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                        placeholder="e.g. Restaurant C / Grand Hotel"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Owner / Contact Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="Full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Partner Type
                        </label>
                        <select
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          value={partnerType}
                          onChange={(e) => setPartnerType(e.target.value)}
                        >
                          <option value="restaurant">Restaurant</option>
                          <option value="hotel">Hotel</option>
                          <option value="shuttle">Shuttle / Transport</option>
                          <option value="parking">Parking Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Official Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="partner@business.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="+91 XXXXX XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Business Address
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                        placeholder="Street, area, city"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-[#F5F5CD] p-5 rounded-2xl border-2 border-black space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block border-b border-black pb-2">
                      DOCUMENT VERIFICATION
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Registration / License ID
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="Business registration number"
                          value={licenseId}
                          onChange={(e) => setLicenseId(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Document Type
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="e.g. Business Registration / License"
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Upload Partner Document (Photo / PDF - Max 10 MB)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-black hover:bg-stone-800 text-[#F5F5CD] px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-colors flex items-center gap-2 border-2 border-black uppercase">
                          <Upload size={14} /> Choose File
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs font-bold text-black truncate">
                          {documentFileName || 'No file chosen (Max 10 MB)'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ORGANIZER FORM */
                <div className="space-y-5">
                  <div className="bg-[#F5F5CD] p-5 rounded-2xl border-2 border-black space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block border-b border-black pb-2">
                      ORGANIZER VERIFICATION DETAILS
                    </span>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="organizer@event.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-black mb-1 block uppercase">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                          placeholder="+91 XXXXX XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        User License ID (Event / Government License ID)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                        placeholder="Enter License ID"
                        value={licenseId}
                        onChange={(e) => setLicenseId(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">
                        Upload Document Photo (Max 10 MB)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-black hover:bg-stone-800 text-[#F5F5CD] px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-colors flex items-center gap-2 border-2 border-black uppercase">
                          <Upload size={14} /> Choose Photo
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <span className="text-xs font-bold text-black truncate">
                          {documentFileName || 'No photo chosen (Max 10 MB)'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-black mb-1 block uppercase">Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FAFAD9] border-2 border-black text-sm text-black font-bold focus:outline-none"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="py-3 px-8 rounded-2xl bg-[#F5F5CD] hover:bg-[#FAFAD9] font-black text-xs text-black border-2 border-black uppercase shadow-sm"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3.5 px-10 rounded-2xl bg-black hover:bg-stone-800 text-[#F5F5CD] font-black text-sm border-2 border-black shadow-md transition-all uppercase flex items-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#F5F5CD] border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : selectedRole === 'admin' ? (
                    'Sign In as Admin'
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="text-center py-2 text-xs font-bold text-stone-800">
        Already have an account?{' '}
        <Link to="/login" className="font-black text-black hover:underline uppercase">
          Sign in
        </Link>
      </div>
    </div>
  );
}
