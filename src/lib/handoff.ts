/** A photo passed from one art form's reader to another's, so a visitor does not have to choose it again. */
let pending: File | null = null;

export const handOverPhoto = (file: File) => { pending = file; };

export const takeHandedOverPhoto = (): File | null => {
    const file = pending;
    pending = null;
    return file;
};
