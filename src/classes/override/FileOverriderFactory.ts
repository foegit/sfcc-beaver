import IFileOverrider from './IFileOverrider';
import EmptyOverrider from './implementation/DefaultOverrider';

export default class FileOverriderFactory {
    static get(type : string) : IFileOverrider {
        switch (type) {
            default: return new EmptyOverrider();
        }
    }
}