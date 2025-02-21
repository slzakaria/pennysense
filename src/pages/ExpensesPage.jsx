import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table } from '../components/Table';
import supabase from '../services/supabase';
import { deleteExpense } from '../helpers';
import { useUser } from '../context/UserContext';
import { AddExpenseForm } from '../components/AddExpenseForm';

export function ExpensesPage() {
	const navigate = useNavigate();
	const { user, loading: userLoading } = useUser();
	const [expenses, setExpenses] = useState([]);
	const [budgets, setBudgets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchExpenses = async () => {
			if (!user) {
				navigate('/login');
				return;
			}

			try {
				const { data, error } = await supabase
					.from('expenses')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });

				if (error) throw error;
				setExpenses(data || []);
			} catch (error) {
				setError(error);
				toast.error('Failed to load expenses');
			} finally {
				setLoading(false);
			}
		};

		const fetchBudgets = async () => {
			if (!user) return;

			try {
				const { data, error } = await supabase.from('budgets').select('*').eq('user_id', user.id);

				if (error) throw error;
				setBudgets(data || []);
			} catch (error) {
				toast.error('Failed to load budgets');
			}
		};

		fetchExpenses();
		fetchBudgets();
	}, [navigate, user]);

	const handleExpenseAdd = (newExpense) => {
		setExpenses((prev) => [...prev, newExpense]);
	};

	const handleExpenseDelete = async (expenseId) => {
		try {
			await deleteExpense(expenseId);
			setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
			toast.success('Expense deleted successfully!');
		} catch (error) {
			toast.error('Failed to delete expense');
		}
	};

	if (userLoading || loading) return <div>Loading...</div>;
	if (error) return <div className='text-tomato'>Error loading expenses</div>;

	return (
		<div className='grid gap-8'>
			<h1 className='text-alice text-xl'>All Expenses</h1>
			<AddExpenseForm budgets={budgets} onExpenseAdd={handleExpenseAdd} />
			{expenses && expenses.length > 0 ? (
				<div className='grid gap-6'>
					<h2 className='text-alice text-lg'>
						Recent Expenses <small>({expenses.length} total)</small>
					</h2>
					<Table expenses={expenses} onDelete={handleExpenseDelete} />
				</div>
			) : (
				<p className='text-alice text-lg'>No Expenses to show</p>
			)}
		</div>
	);
}
