import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AddExpenseForm } from '../components/AddExpenseForm';
import { BudgetItem } from '../components/BudgetItem';
import { Table } from '../components/Table';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import supabase from '../services/supabase';

export function BudgetPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user, loading: userLoading } = useUser();
	const [budget, setBudget] = useState(null);
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBudgetData = async () => {
			if (!user) return;

			try {
				const { data: budgetData, error: budgetError } = await supabase
					.from('budgets')
					.select('*')
					.eq('id', id)
					.eq('user_id', user.id)
					.single();

				if (budgetError || !budgetData) {
					throw new Error('Budget not found');
				}

				setBudget(budgetData);

				const { data: expensesData } = await supabase
					.from('expenses')
					.select('*')
					.eq('budget_id', id)
					.eq('user_id', user.id);

				setExpenses(expensesData || []);
			} catch (error) {
				toast.error('Failed to load budget');
				navigate('/');
			} finally {
				setLoading(false);
			}
		};

		fetchBudgetData();
	}, [id, user, navigate]);

	if (userLoading || loading) return <div>Loading...</div>;

	return (
		<div className='grid gap-4'>
			<h1 className='text-2xl font-bold text-alice'>
				<BudgetItem budget={budget} showDelete={true} />
			</h1>
			<div className='grid gap-4'>
				<AddExpenseForm budgets={[budget]} />
				{expenses && expenses.length > 0 && (
					<div className='grid gap-4'>
						<h2 className='text-xl text-alice'>Expenses</h2>
						<Table expenses={expenses} showBudget={false} />
					</div>
				)}
			</div>
		</div>
	);
}
