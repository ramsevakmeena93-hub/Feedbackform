import { Mail, Linkedin, Github, GraduationCap, Briefcase, Award, Code2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Developer = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {user && <Navbar title="Developer" />}

      {/* Header bar for non-logged-in users */}
      {!user && (
        <header className="w-full bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
            <a href="http://localhost:5176/landing" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
              <p className="font-bold text-slate-900 text-sm">MITS Feedback System</p>
            </a>
            <a href="http://localhost:5176/landing" className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors">← Back to Home</a>
          </div>
        </header>
      )}

      <div className="flex-1 py-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Animated Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Code2 className="w-64 h-64 text-indigo-600 animate-pulse" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-indigo-100 px-6 py-2 rounded-full mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="text-indigo-700 font-semibold">Meet the Developer</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Ajay Meena
              </h1>
              <p className="text-xl text-gray-600">Full Stack Web Developer & AI Enthusiast</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left — Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 sticky top-6">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden border-4 border-indigo-500 shadow-lg hover:scale-105 transition-transform">
                    <img src="/ajay-meena.png" alt="Ajay Meena"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: '50% 20%' }}
                      onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">A</div>'; }}
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      MITS Gwalior
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="text-center mt-8 mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                    <span className="text-green-700 text-sm font-medium">Available for Projects</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <a href="mailto:25tc1aj7@mitsgwl.ac.in"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all group">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">25tc1aj7@mitsgwl.ac.in</p>
                    </div>
                  </a>
                  <a href="https://www.linkedin.com/in/ajay-meena-607a7b376" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">LinkedIn</p>
                      <p className="text-sm font-medium text-gray-900">Connect with me</p>
                    </div>
                  </a>
                  <a href="https://github.com/ramsevakmeena93-hub" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Github className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">GitHub</p>
                      <p className="text-sm font-medium text-gray-900">View Projects</p>
                    </div>
                  </a>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">3</p>
                    <p className="text-xs text-gray-600">Hackathons Won</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Education */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                </div>
                <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-500">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-gray-900">Madhav Institute of Technology & Science</h3>
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">2025 – 2029</span>
                  </div>
                  <p className="text-indigo-700 font-medium mb-3">B.Tech in Computer Science & Technology</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"/>
                    <span className="text-gray-600">Enrollment: <span className="font-semibold text-gray-900">BTTC25O1007</span></span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Centre for Computer Science & Technology</p>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
                </div>
                <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-gray-900">Software Intern</h3>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Nov 2025 – Jan 2026</span>
                  </div>
                  <p className="text-blue-700 font-medium mb-1">Yuga Yatra Retails</p>
                  <p className="text-sm text-gray-600">Bangalore, India</p>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Key Achievements</h2>
                </div>
                <div className="grid gap-3">
                  {[
                    'Securing First Position in Quick Quest conducted by ISBM Bangalore',
                    'Winner of 3 Hackathons in various cutting-edge technologies',
                    'Worked on 7+ projects in different fields including Web Development, AI/ML, Blockchain, and Hardware',
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:shadow-md transition-shadow">
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Under the Guidance of */}
          <div className="mt-12 mb-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Under the Guidance of</h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 hover:shadow-lg transition-shadow">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-indigo-500 shadow-lg hover:scale-105 transition-transform shrink-0">
                    <img src="/sir.png" alt="Dr. Abhishek Dixit"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: '50% 15%' }}
                      onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<div class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">D</div>'; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. Abhishek Dixit</h3>
                    <p className="text-indigo-700 font-medium mb-1">Assistant Professor & Coordinator</p>
                    <p className="text-sm text-gray-600">Centre for Computer Science and Technology</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Developer;
