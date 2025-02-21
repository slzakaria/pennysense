import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function Main() {
	return (
		<div className='flex flex-col min-h-screen'>
			<ErrorBoundary>
				<Navbar />
				<main className='grow w-full max-w-[1200px] mx-auto'>
					<Outlet />
				</main>
			</ErrorBoundary>
		</div>
	);
}
