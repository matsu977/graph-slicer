<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>GraphSlicer</title>
       @viteReactRefresh
       @vite(['resources/css/app.css', 'resources/js/app.jsx'])
   </head>
   <body>
       <header class="bg-emerald-700 text-white p-4 shadow-md">
           <div class="container mx-auto flex items-center">
               <div class="flex items-center space-x-3">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-10 h-10">
                       <circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="4"/>
                       <path d="M50 10 L50 90" stroke="white" stroke-width="4" opacity="0.8"/>
                       <path d="M20 65 Q35 25 80 35" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>
                       <circle cx="50" cy="45" r="4" fill="white"/>
                   </svg>
                   <h1 class="text-2xl font-bold">GraphSlicer</h1>
               </div>
           </div>
       </header>
       <div id="app"></div>
       <footer class="bg-emerald-700 text-white p-4 text-center">
           <p>&copy; GraphSlicer. All rights reserved.</p>
       </footer>
   </body>
</html>