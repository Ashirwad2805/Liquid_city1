import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth, getDashboardPath } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Check,
  Users,
  Calendar,
  Briefcase,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';

type Role = 'organizer' | 'partner' | 'visitor' | 'admin';

const ADMIN_EMAILS = [
  'ashirwad@admin.com',
  'shubham@admin.com',
  'saif@admin.com',
  'neelaj@admin.com',
];

const DESTINATIONS = [
  { id: 'dest_1', name: 'Central Stadium Arena & Cultural Zone', coords: { lat: 12.9716, lng: 77.5946 } },
  { id: 'dest_2', name: 'Downtown Food & Entertainment District', coords: { lat: 12.9780, lng: 77.6000 } },
  { id: 'dest_3', name: 'Tech Park Pavilion & Exhibition Grounds', coords: { lat: 12.9650, lng: 77.5900 } },
  { id: 'dest_4', name: 'Beachfront Promenade & Resort Strip', coords: { lat: 12.9850, lng: 77.6100 } },
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
    subtitle: 'Manage events & crowd control',
    description: 'Sign in to access venue setup, crowd telemetry & allocations',
    icon: <Calendar size={28} className="text-black" />,
  },
  {
    role: 'partner',
    label: 'Partner',
    subtitle: 'Restaurants, Hotels & Services',
    description: 'Sign in to manage capacity, live offers & visitor arrivals',
    icon: <Briefcase size={28} className="text-black" />,
  },
  {
    role: 'visitor',
    label: 'Visitor',
    subtitle: 'Explore city & redeem 1-hr QR offers',
    description: 'Choose your destination, view routes, nearby hotels & offers',
    icon: <Users size={28} className="text-black" />,
  },
  {
    role: 'admin',
    label: 'Admin',
    subtitle: 'System Control & Analytics',
    description: 'Sign in for system command, digital twin & simulation',
    icon: <ShieldCheck size={28} className="text-black" />,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  // Step state
  const [selectedRole, setSelectedRole] = useState<Role>('visitor');
  const [step, setStep] = useState<'role' | 'destination' | 'form'>('role');
  const [selectedDestination, setSelectedDestination] = useState<string>(DESTINATIONS[0].name);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expired = params.get('expired') === '1';

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    if (role === 'visitor') {
      // Visitors choose destination first
      setStep('destination');
    } else {
      setStep('form');
    }
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const cleanEmail = email.trim().toLowerCase();

      // ADMIN ROLE LOGIN CHECK
      if (selectedRole === 'admin') {
        if (!ADMIN_EMAILS.includes(cleanEmail)) {
          setError('Invalid Admin email address. Allowed admin emails are ashirwad@admin.com, shubham@admin.com, etc.');
          setLoading(false);
          return;
        }
        if (password !== 'adminlogin') {
          setError('Invalid Admin password. The password for admin accounts is: adminlogin');
          setLoading(false);
          return;
        }

        const adminUser = {
          id: `admin_${Date.now()}`,
          email: cleanEmail,
          name: cleanEmail.split('@')[0].toUpperCase() + ' (Admin)',
          role: 'admin' as UserRole,
        };

        login(adminUser, 'admin-token');
        navigate(getDashboardPath('admin'));
        return;
      }

      // VISITOR, ORGANIZER, PARTNER LOGIN
      const user = {
        id: `u_${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: selectedRole as UserRole,
        partnerType: selectedRole === 'partner' ? ('restaurant' as const) : undefined,
        destination: selectedRole === 'visitor' ? selectedDestination : undefined,
      };

      // Save destination to localStorage for Visitor filtering
      if (selectedRole === 'visitor') {
        localStorage.setItem('lc_visitor_destination', selectedDestination);
      }

      login(user, 'demo-token');
      navigate(getDashboardPath(selectedRole as UserRole));
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5CD] text-black flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-black selection:text-[#F5F5CD]">
      {/* Brand Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 mb-6 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-[#F5F5CD] font-black text-sm tracking-wider border-2 border-black">
            LC
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-black uppercase">LiquidCity</span>
            <p className="text-[11px] font-bold text-stone-700">Smart Event & Crowd Platform</p>
          </div>
        </div>

        <Link
          to="/signup"
          className="text-xs font-black text-black hover:underline flex items-center gap-1 bg-[#E2E2A4] px-4 py-2 rounded-xl border-2 border-black uppercase"
        >
          Sign up / Register <ArrowLeft size={14} className="rotate-180" />
        </Link>
      </div>

      <div className="max-w-4xl w-full mx-auto my-auto py-4">
        {step === 'role' ? (
          /* STEP 1: 4 ROLE SELECTION OPTIONS (Matching Sign-Up Page) */
          <div className="space-y-8 animate-fade-in text-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-black tracking-tight uppercase">
                Sign In to LiquidCity
              </h1>
              <p className="text-stone-800 text-xs font-bold uppercase tracking-wider mt-2">
                Select your role to proceed to sign in
              </p>
            </div>

            <div className="text-left max-w-3xl mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-black mb-4 block">
                SELECT YOUR ROLE TO SIGN IN
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ROLE_CARDS.map((card) => {
                  const isSelected = selectedRole === card.role;
                  return (
                    <div
                      key={card.role}
                      onClick={() => handleRoleSelect(card.role)}
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
                              isSelected ? 'bg-[#F5F5CD] text-black' : 'bg-[#FAFAD9]'
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
                          handleRoleSelect(card.role);
                        }}
                        className={`mt-6 w-full py-3 px-4 rounded-2xl font-black text-xs transition-colors border-2 border-black uppercase shadow-sm ${
                          isSelected
                            ? 'bg-[#F5F5CD] text-black hover:bg-white'
                            : 'bg-black text-[#F5F5CD] hover:bg-stone-800'
                        }`}
                      >
                        Sign In as {card.label}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                  Selected role: <strong className="text-black font-black">{selectedRole.toUpperCase()}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => handleRoleSelect(selectedRole)}
                  className="py-3.5 px-12 rounded-2xl bg-black hover:bg-stone-800 text-[#F5F5CD] font-black text-sm border-2 border-black shadow-md transition-all uppercase"
                >
                  Continue to {selectedRole.toUpperCase()} Sign In
                </button>
              </div>
            </div>
          </div>
        ) : step === 'destination' ? (
          /* STEP 1.5: VISITOR DESTINATION SELECTION MODAL */
          <div className="max-w-2xl mx-auto bg-[#E2E2A4] rounded-3xl border-2 border-black p-6 md:p-10 shadow-xl animate-fade-in space-y-6">
            <div className="border-b-2 border-black pb-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#F5F5CD] px-3 py-1 rounded-full border border-black">
                VISITOR DESTINATION ONBOARDING
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase mt-2">
                Choose Your Target Destination
              </h2>
              <p className="text-xs font-bold text-stone-800 mt-1">
                Select your event venue or area. LiquidCity will filter nearby routes, restaurants, hotels, crowd density & live 1-hr QR offers accordingly.
              </p>
            </div>

            <div className="space-y-3">
              {DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest.name)}
                  className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-center justify-between ${
                    selectedDestination === dest.name
                      ? 'bg-black text-[#F5F5CD] shadow-md'
                      : 'bg-[#F5F5CD] text-black hover:bg-[#FAFAD9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black border border-black ${
                        selectedDestination === dest.name ? 'bg-[#F5F5CD] text-black' : 'bg-black text-[#F5F5CD]'
                      }`}
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase">{dest.name}</h4>
                      <p
                        className={`text-[11px] font-semibold ${
                          selectedDestination === dest.name ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        Active GPS & Crowd telemetry synchronized
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 border-black flex items-center justify-center ${
                      selectedDestination === dest.name ? 'bg-[#F5F5CD] text-black' : 'bg-[#FAFAD9]'
                    }`}
                  >
                    {selectedDestination === dest.name && <Check size={12} className="text-black font-black" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="py-3 px-8 rounded-2xl bg-[#F5F5CD] hover:bg-[#FAFAD9] font-black text-xs text-black border-2 border-black uppercase"
              >
                Back to Roles
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="py-3.5 px-10 rounded-2xl bg-black hover:bg-stone-800 text-[#F5F5CD] font-black text-sm border-2 border-black shadow-md uppercase flex items-center gap-2"
              >
                Confirm Destination & Sign In
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: ROLE-SPECIFIC LOGIN FORM */
          <div className="max-w-md mx-auto bg-[#E2E2A4] p-8 rounded-3xl border-2 border-black shadow-xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#F5F5CD] px-2.5 py-1 rounded-full border border-black">
                  {selectedRole.toUpperCase()} SIGN IN
                </span>
                <h2 className="text-2xl font-black text-black uppercase mt-1">
                  Sign In
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep('role')}
                className="text-xs font-black text-black bg-[#F5F5CD] border-2 border-black px-3 py-1.5 rounded-xl uppercase hover:bg-black hover:text-[#F5F5CD]"
              >
                Change Role
              </button>
            </div>

            {selectedRole === 'visitor' && (
              <div className="bg-[#F5F5CD] p-3 rounded-2xl border-2 border-black text-xs font-bold text-black flex items-center justify-between">
                <span className="truncate">🎯 Target: <strong>{selectedDestination}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('destination')}
                  className="text-[10px] uppercase underline ml-2 font-black"
                >
                  Change
                </button>
              </div>
            )}

            {expired && (
              <div className="flex items-center gap-2 p-3 bg-[#F5F5CD] border-2 border-black rounded-2xl text-xs text-black font-bold">
                <AlertCircle size={15} />
                Session expired. Please sign in again.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#F5F5CD] border-2 border-black rounded-2xl text-xs text-black font-bold">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-black text-black uppercase tracking-wider mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F5F5CD] border-2 border-black text-sm text-black placeholder-stone-600 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-xs font-black text-black uppercase tracking-wider mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F5CD] border-2 border-black text-sm text-black pr-10 placeholder-stone-600 font-bold focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-stone-700"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-black text-[#F5F5CD] font-black text-sm border-2 border-black hover:bg-stone-800 transition-all shadow-md uppercase"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#F5F5CD] border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  `Sign In as ${selectedRole.toUpperCase()}`
                )}
              </button>
            </form>

            <div className="pt-4 border-t-2 border-black text-center">
              <span className="text-xs font-semibold text-stone-800">Need a new account? </span>
              <Link to="/signup" className="text-xs font-black text-black hover:underline uppercase">
                Create an account
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-2 text-xs font-bold text-stone-800">
        Already have an account?{' '}
        <Link to="/signup" className="font-black text-black hover:underline uppercase">
          Create an account
        </Link>
      </div>
    </div>
  );
}
