import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mb-10 ">
        <div className="mt-6 border-t border-gray-700 pt-5 text-center text-gray-400 ">
          <p>&copy; {new Date().getFullYear()} Global Tech Software Solutions. All rights reserved.</p>
        </div>
    </footer>
  );
}