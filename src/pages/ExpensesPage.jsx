import { useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { Table } from "../components/Table";
import { deleteItem, fetchData } from "../helpers";

export async function expensesLoader() {
	const expenses = fetchData("expenses");
	return { expenses };
}

export async function expensesAction({ request }) {
	const data = await request.formData();
	const { _action, ...values } = Object.fromEntries(data);

	if (_action === "deleteExpense") {
		try {
			deleteItem({
				key: "expenses",
				id: values.expenseId,
			});
			return toast.success("Expense deleted!");
		} catch (e) {
			throw new Error("There was a problem deleting your expense.");
		}
	}
}

export function ExpensesPage() {
	const { expenses } = useLoaderData();
	return (
		<div className='grid gap-8'>
			<h1 className='text-alice text-xl'>All Expenses</h1>
			{expenses && expenses.length > 0 ? (
				<div className='grid gap-6'>
					<h2 className='text-alice text-lg'>
						Recent Expenses <small>({expenses.length} total)</small>
					</h2>
					<Table expenses={expenses} />
				</div>
			) : (
				<p className='text-alice text-lg'>No Expenses to show</p>
			)}
		</div>
	);
}
