export default function Logo() {
  return (
    <div className="flex flex-col items-start md:items-start">
      <div className="flex items-center space-x-2">
        <img
          src="/Images/logo.png"
          alt="EventPro Logo"
          className="h-12 w-12 object-contain"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-900">EventPro</h1>
          <p className="text-xs text-red-500 font-semibold -mt-1">
            Celebrate Every Moment
          </p>
        </div>
      </div>
    </div>
  );
}
