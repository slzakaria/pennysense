import { useState, useEffect } from 'react';
import supabase from '../services/supabase';

export const useUser = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			setLoading(false);
		};

		fetchUser();
	}, []);

	return { user, loading };
};
