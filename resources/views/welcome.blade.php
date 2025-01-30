<!DOCTYPE html>
<html lang="en">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>GraphSlicer</title>
       @viteReactRefresh
       @vite(['resources/css/app.css', 'resources/js/app.jsx'])
   </head>
   <body class="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col">
       <header class="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 shadow-lg">
           <div class="container mx-auto flex items-center justify-between">
               <div class="flex items-center space-x-4">
                   <div class="transform hover:rotate-12 transition-transform duration-300">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-12 h-12 drop-shadow-md">
                           <circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="4" class="opacity-90"/>
                           <path d="M50 10 L50 90" stroke="white" stroke-width="4" opacity="0.8" class="animate-pulse"/>
                           <path d="M20 65 Q35 25 80 35" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>
                           <circle cx="50" cy="45" r="4" fill="white" class="animate-bounce"/>
                       </svg>
                   </div>
                   <h1 class="text-3xl font-bold tracking-tight hover:tracking-wide transition-all duration-300">
                   Data<span class="text-emerald-200">Slicer</span>
                   </h1>
               </div>
               <nav class="hidden md:flex space-x-6 text-emerald-50">
                   <a href="#" class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Home</a>
                   <a href="#" class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Features</a>
                   <a href="#" class="hover:text-white hover:underline decoration-2 underline-offset-4 transition-all">Documentation</a>
               </nav>
           </div>
       </header>
       
       <main class="flex-grow container mx-auto p-6">
           <div id="app"></div>
       </main>

       <footer class="bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-8 px-6">
           <div class="container mx-auto">
               <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                   <p class="text-emerald-100">&copy; 2025 DataSlicer. All rights reserved.</p>
                   <div class="flex space-x-6">
                       <a href="#" class="text-emerald-100 hover:text-white transition-colors">Privacy Policy</a>
                       <a href="#" class="text-emerald-100 hover:text-white transition-colors">Terms of Service</a>
                       <a href="#" class="text-emerald-100 hover:text-white transition-colors">Contact</a>
                   </div>
               </div>
           </div>
       </footer>
   </body>
</html>