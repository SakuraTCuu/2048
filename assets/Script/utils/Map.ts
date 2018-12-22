


	export class Map {

		private _elements:Array<any> = null;

		public constructor() {
			this._elements = new Array<any>();
		}

		public put(_key:any, _value:any):void {
			let isExist = this.contains(_key);
			if (isExist) {
				this.remove(_key);
			}
			this._elements.push( {
				key : _key,
				value : _value
			});
		}

		public get(_key:any):any {
			try {
				let len = this._elements.length;
				for (let i = 0; i < len; i++) {
					if (this._elements[i].key == _key) {
						return this._elements[i].value;
					}
				}
			} catch (error) {
				console.warn(error.name + ":[" + _key + "]不存在");
				return null;
			}
		}

		public remove(_key:any):boolean {
			try {
				let len = this._elements.length;
				for (let i = 0; i < len; i++) {
					if (this._elements[i].key == _key) {
						this._elements.splice(i, 1);
						return true;
					}
				}
			} catch (error) {
				console.warn(error.name + ":[" + _key + "]不存在");
				return false;
			}
			return false;
		}

		public contains(_key:any):boolean {
			try {
				let len = this._elements.length;
				for (let i = 0; i < len; i++) {
					if (this._elements[i].key == _key) {
						return true;
					}
				}
			} catch (error) {
				console.warn(error.name + ":[" + _key + "]不存在");
				return false;
			}
			return false;
		}

		public getList():Array<any> {
			return this._elements;
		}

		public size():number {
			return this._elements.length;
		}

		public isEmpty():boolean {
			return (this._elements.length < 1);
		}

		public clear():void {
			this._elements = new Array();
		}
	}
