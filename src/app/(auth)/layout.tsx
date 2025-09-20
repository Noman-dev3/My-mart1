'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left side - Hero section */}
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-8 lg:p-12 flex flex-col justify-between">
            {/* Background mountain silhouette */}
            <div className="absolute inset-0 overflow-hidden">
              <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYEnd slice"
              >
                <path
                  d="M0,300 L0,200 Q50,150 100,160 Q150,170 200,140 Q250,110 300,130 Q350,150 400,120 L400,300 Z"
                  fill="rgba(0,0,0,0.2)"
                />
                <path
                  d="M0,300 L0,220 Q60,180 120,190 Q180,200 240,170 Q300,140 360,160 Q380,170 400,150 L400,300 Z"
                  fill="rgba(0,0,0,0.1)"
                />
              </svg>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="text-white text-2xl font-bold">AMU</div>
                <button className="ml-auto text-white/80 hover:text-white flex items-center gap-2 text-sm">
                  Back to website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="relative z-10 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Capturing Moments,<br />
                Creating Memories
              </h1>
              
              {/* Progress dots */}
              <div className="flex justify-center lg:justify-start gap-2 mt-8">
                <div className="w-8 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Right side - Form */}
          <div className="p-8 lg:p-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}