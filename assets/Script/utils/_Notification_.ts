import { Map } from './Map';

export class _Notification_ {

	private static _callbackList: Map = new Map();

	public constructor() {
		// throw (new SimpleError("The burn.Notification can't call constructor!"));
	}

	public static init(): void {
		//this._callbackList = new burn.util.Map();
	}

	public static subscrib(type: number, callback: Function, target: any = null): void {
		let isExist = this._callbackList.contains(type);
		if (isExist) {
			let arr = this._callbackList.get(type);
			arr.push([callback, target]);
		} else {
			let arrobj = new Array();
			arrobj.push([callback, target]);
			this._callbackList.put(type, arrobj);
		}
	}

	public static unsubscrib(type: number, callback: Function): boolean {
		let isExist = this._callbackList.contains(type);
		if (isExist) {
			let arr = this._callbackList.get(type);
			let len = arr.length;
			for (let i = 0; i < len; i++) {
				if (arr[i][0] == callback) {
					arr.splice(i, 1);
					return true;
				}
			}
			return false;
		}
		return false;
	}

	public static removebByType(type: number): boolean {
		let isExist = this._callbackList.contains(type);
		if (isExist) {
			return this._callbackList.remove(type);
		}
		return false;
	}

	public static removeAll(): void {
		this._callbackList.clear();
	}

	public static send(type: number, obj: any = null): void {
		let isExist = this._callbackList.contains(type);
		if (isExist) {
			let arr = this._callbackList.get(type);
			let len = arr.length;
			for (let i = 0; i < len; i++) {
				let temp = arr[i];
				if (temp) {
					temp[0](obj, temp[1]);
					break;
				}
			}
		}
	}
}