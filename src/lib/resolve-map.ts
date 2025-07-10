export type AwaitedMap<T> = {
	[K in keyof T]: T[K] extends Promise<infer U> ? U : never;
};
export async function resolveMap<T extends Record<string, Promise<any>>>(
	map: T
): Promise<AwaitedMap<T>> {
	const keys = Object.keys(map);
	const promises = Object.values(map);
	const values = await Promise.all(promises);
	const result = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
	return result as AwaitedMap<T>;
}
