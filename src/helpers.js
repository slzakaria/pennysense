import supabase from './services/supabase';

export const getDate = () => {
	const currentDate = new Date();
	return `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
};

export const formatCurrency = (amt) => {
	return amt.toLocaleString(undefined, {
		style: 'currency',
		currency: 'USD',
	});
};

export const getTotalBudgets = async (userId) => {
	if (!userId) {
		console.warn('No user ID provided to getTotalBudgets');
		return 0;
	}

	try {
		const { data, error } = await supabase.from('budgets').select('amount').eq('user_id', userId);

		if (error) {
			console.error('Error fetching budgets:', error);
			return 0;
		}

		return data ? data.reduce((acc, budget) => acc + Number(budget.amount), 0) : 0;
	} catch (error) {
		console.error('Error in getTotalBudgets:', error);
		return 0;
	}
};

export const getTotalExpenses = async (userId) => {
	if (!userId) {
		console.warn('No user ID provided to getTotalExpenses');
		return 0;
	}

	try {
		const { data, error } = await supabase.from('expenses').select('amount').eq('user_id', userId);

		if (error) {
			console.error('Error fetching expenses:', error);
			return 0;
		}

		return data ? data.reduce((acc, expense) => acc + Number(expense.amount), 0) : 0;
	} catch (error) {
		console.error('Error in getTotalExpenses:', error);
		return 0;
	}
};

export const updateBudget = async ({ id, name, amount }) => {
	const { data, error } = await supabase
		.from('budgets')
		.update({ name, amount: +amount })
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error updating budget:', error);
		throw error;
	}

	return data;
};

export const updateExpense = async ({ id, name, amount, budgetId }) => {
	const { data, error } = await supabase
		.from('expenses')
		.update({
			name,
			amount: +amount,
			budget_id: budgetId,
			updated_at: new Date().toISOString(),
		})
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error updating expense:', error);
		throw error;
	}

	return data;
};

export const calculateSpentByBudget = async (budgetId) => {
	if (!budgetId) {
		console.warn('No budget ID provided to calculateSpentByBudget');
		return 0;
	}

	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			console.warn('No authenticated user found');
			return 0;
		}

		const { data, error } = await supabase
			.from('expenses')
			.select('amount')
			.eq('budget_id', budgetId)
			.eq('user_id', user.id);

		if (error) {
			console.error('Error calculating budget spending:', error);
			return 0;
		}

		return data ? data.reduce((acc, expense) => acc + Number(expense.amount), 0) : 0;
	} catch (error) {
		console.error('Error in calculateSpentByBudget:', error);
		return 0;
	}
};

export const formatDateToLocaleString = (epoch) => new Date(epoch).toLocaleDateString();
export const formatDate = (dateString) => {
	if (!dateString) return '';

	return new Date(dateString).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export const formatPercentage = (amt) => {
	return amt.toLocaleString(undefined, {
		style: 'percent',
		minimumFractionDigits: 0,
	});
};

export const getAllMatchingItems = async ({ category, key, value }) => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			console.warn('No authenticated user found in getAllMatchingItems');
			return [];
		}

		if (!value) {
			console.warn(`No value provided for ${key} in getAllMatchingItems`);
			return [];
		}

		const { data, error } = await supabase
			.from(category)
			.select('*')
			.eq(key, value)
			.eq('user_id', user.id);

		if (error) {
			console.error(`Error fetching ${category}:`, error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error('Error in getAllMatchingItems:', error);
		return [];
	}
};

export const deleteBudget = async (id) => {
	const { error } = await supabase.from('budgets').delete().eq('id', id);

	if (error) {
		console.error('Error deleting budget:', error);
		throw error;
	}
};

export const deleteExpense = async (id) => {
	const { error } = await supabase.from('expenses').delete().eq('id', id);

	if (error) {
		console.error('Error deleting expense:', error);
		throw error;
	}
};
