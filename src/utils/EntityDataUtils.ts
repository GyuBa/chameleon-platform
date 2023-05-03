export class EntityDataUtils {
    static toData(keys: string[], entity: any) {
        return keys.reduce((obj, key) => ({
            ...obj,
            [key]: entity[key]?.toData ? entity[key].toData() : entity[key]
        }), {});
    }
}