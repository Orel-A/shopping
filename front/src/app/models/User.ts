export interface User {
	user_id: number,
	first_name: string,
	last_name: string,
	id: string,
	email: string,
	city: string,
	street: string,
	is_admin: number
}

export interface RegisterStepOne {
	id: string,
	email: string
}

export interface RegisterUser {
	first_name: string,
	last_name: string,
	id: string,
	email: string,
	city: string,
	street: string,
	password: string
}

export interface LoginUser {
	email: string,
	password: string
}