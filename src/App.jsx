import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Main } from './layouts/Main';
import { Dashboard } from './pages/Dashboard';
import { BudgetPage } from './pages/BudgetPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { Error } from './pages/Error';
import { Stats } from './pages/Stats';
import { Auth } from './components/Auth';
import { ErrorBoundary } from './components/ErrorBoundary';

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Main />,
			errorElement: <Error />,
			children: [
				{
					index: true,
					element: <Dashboard />,
				},
				{
					path: 'budget/:id',
					element: <BudgetPage />,
				},
				{
					path: 'expenses',
					element: <ExpensesPage />,
				},
				{
					path: 'stats',
					element: <Stats />,
				},
				{
					path: 'login',
					element: <Auth />,
				},
			],
		},
	],
	{
		future: {
			v7_startTransition: true,
		},
	}
);

export function App() {
	return (
		<ErrorBoundary>
			<RouterProvider router={router} />
			<ToastContainer theme='colored' limit={1} autoClose={1500} />
		</ErrorBoundary>
	);
}
