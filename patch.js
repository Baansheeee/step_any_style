const fs = require('fs');
let code = fs.readFileSync('app/components/Navbar.tsx', 'utf8');

code = code.replace(
  '<div className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-20">',
  '<div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">'
);
code = code.replace(
  '<div className="flex justify-between items-center h-20">',
  '<div className="flex justify-between items-center h-24">'
);
code = code.replace(
  '            {/* Logo */}\n            <Link href="/" className="group flex items-center -ml-3 sm:-ml-6 md:-ml-20">',
  '            {/* Logo */}\n            <div className="flex-1 flex justify-start">\n              <Link href="/" className="group flex items-center -ml-2 sm:-ml-4 md:-ml-8">'
);
code = code.replace(
  'width={300}\n                height={100}',
  'width={500}\n                height={150}'
);
code = code.replace(
  'h-24 md:h-32',
  'h-32 md:h-44'
);
code = code.replace(
  'group-hover:scale-110',
  'group-hover:scale-105'
);
code = code.replace(
  '              />\n            </Link>\n\n            {/* Desktop Navigation */}\n            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8 ml-6 xl:ml-16 h-full">',
  '              />\n              </Link>\n            </div>\n\n            {/* Desktop Navigation */}\n            <div className="hidden md:flex flex-[2.5] justify-center items-center space-x-2 lg:space-x-4 xl:space-x-6 h-full">'
);

code = code.replace(/text-\[13px\] font-black uppercase/g, 'text-[10px] lg:text-[11px] xl:text-[13px] font-black uppercase');

code = code.replace(
  '              <div className="h-4 w-[1px] bg-white/20 mx-2" />\n\n              <div className="relative h-full flex items-center" ref={accountMenuRef}>',
  '            </div>\n\n            {/* Icons */}\n            <div className="hidden md:flex flex-1 justify-end items-center space-x-2 lg:space-x-4 h-full">\n\n              <div className="relative h-full flex items-center" ref={accountMenuRef}>'
);

fs.writeFileSync('app/components/Navbar.tsx', code);
