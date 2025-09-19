import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-3 shadow-lg backdrop-blur">
          <ul className="grid grid-cols-4 items-center gap-6 text-neutral-200">
            {/* Today */}
            <li className="flex justify-center">
              <button className="rounded-xl bg-white p-2 text-neutral-900 shadow hover:bg-neutral-100">
                <HomeIcon className="size-6" />
              </button>
            </li>

            {/* Summary（将来用） */}
            <li className="flex justify-center">
              <button className="rounded-xl p-2 hover:bg-white/10">
                <ChartBarIcon className="size-6" />
              </button>
            </li>

            {/* MyPage（将来用） */}
            <li className="flex justify-center">
              <button className="rounded-xl p-2 hover:bg-white/10">
                <UserCircleIcon className="size-6" />
              </button>
            </li>

            {/* Settings（将来用） */}
            <li className="flex justify-center">
              <button className="rounded-xl p-2 hover:bg-white/10">
                <Cog6ToothIcon className="size-6" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
