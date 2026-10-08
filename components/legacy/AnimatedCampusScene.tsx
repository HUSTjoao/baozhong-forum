// Preserved from the original homepage for reuse with future artwork.
export default function AnimatedCampusScene() {
  return (
<div className="hidden lg:flex relative items-center justify-center min-h-[500px]">
              <div className="relative w-full max-w-lg h-[500px]">
                {/* 3D书本 - 浮空效果 */}
                <div className="absolute left-1/4 top-1/3 transform -translate-x-1/2 -translate-y-1/2 animate-float-slow">
                  <div className="relative w-36 h-28" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-15deg) rotateX(5deg)' }}>
                    {/* 书封面 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-lg shadow-2xl border-2 border-amber-300/50" style={{ transform: 'translateZ(8px)' }}>
                      <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-md"></div>
                      <div className="absolute top-4 left-4 right-4 h-1.5 bg-white/60 rounded"></div>
                      <div className="absolute top-6 left-4 right-4 h-0.5 bg-white/40 rounded"></div>
                      <div className="absolute top-8 left-4 right-4 h-0.5 bg-white/40 rounded"></div>
                    </div>
                    {/* 书页厚度 */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-600/80 to-amber-500/60 rounded-l" style={{ transform: 'rotateY(-90deg) translateZ(-18px)' }}></div>
                  </div>
                </div>

                {/* 学位帽 - 浮空旋转 */}
                <div className="absolute right-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-float">
                  <div className="relative w-24 h-24" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(20deg)' }}>
                    {/* 帽顶 */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-t-full shadow-2xl" style={{ transform: 'translateZ(0px)' }}>
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg"></div>
                    </div>
                    {/* 帽檐 */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-gray-800 to-gray-700 rounded-full shadow-xl" style={{ transform: 'translateY(4px)' }}></div>
                  </div>
                </div>

                {/* 对话气泡1 - 右上角 */}
                <div className="absolute right-0 top-20 animate-bubble-1">
                  <div className="relative bg-gradient-to-br from-white to-amber-50/80 rounded-2xl px-5 py-4 shadow-2xl border-2 border-amber-300/80 backdrop-blur-sm">
                    <div className="text-base font-semibold text-gray-800">加油！💪</div>
                    <div className="absolute -bottom-2 right-8 w-5 h-5 bg-white border-r-2 border-b-2 border-amber-300/80 transform rotate-45"></div>
                  </div>
                </div>

                {/* 对话气泡2 - 左上角 */}
                <div className="absolute left-0 top-32 animate-bubble-2">
                  <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl px-5 py-4 shadow-2xl border-2 border-orange-400/80 backdrop-blur-sm">
                    <div className="text-base font-semibold text-orange-900">一起努力！🚀</div>
                    <div className="absolute -bottom-2 left-8 w-5 h-5 bg-amber-100 border-l-2 border-b-2 border-orange-400/80 transform rotate-45"></div>
                  </div>
                </div>

                {/* 对话气泡3 - 右下角 */}
                <div className="absolute right-8 bottom-32 animate-bubble-3">
                  <div className="relative bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl px-5 py-4 shadow-2xl border-2 border-yellow-400/80 backdrop-blur-sm">
                    <div className="text-base font-semibold text-yellow-900">未来可期✨</div>
                    <div className="absolute -bottom-2 right-10 w-5 h-5 bg-yellow-100 border-r-2 border-b-2 border-yellow-400/80 transform rotate-45"></div>
                  </div>
                </div>

                {/* 星星装饰 - 更大更明显 */}
                <div className="absolute top-16 left-1/3 text-4xl text-yellow-300 drop-shadow-lg animate-twinkle" style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.8)' }}>✦</div>
                <div className="absolute bottom-24 right-1/4 text-4xl text-amber-300 drop-shadow-lg animate-twinkle" style={{ animationDelay: '1s', textShadow: '0 0 10px rgba(245, 158, 11, 0.8)' }}>✦</div>
                <div className="absolute top-40 right-1/3 text-3xl text-orange-300 drop-shadow-lg animate-twinkle" style={{ animationDelay: '0.5s', textShadow: '0 0 10px rgba(251, 146, 60, 0.8)' }}>⭐</div>

                {/* 装饰性光晕 - 暖色调增强 */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-400/50 to-orange-400/40 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-orange-400/50 to-amber-400/40 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-400/35 rounded-full blur-2xl"></div>
              </div>
            </div>
  )
}
