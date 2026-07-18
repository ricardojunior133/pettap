interface PetNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PetNameInput({
  value,
  onChange,
}: PetNameInputProps) {
  return (
    <div className="mb-8">
      <label
        htmlFor="petName"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Pet Name
      </label>

      <input
        id="petName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your pet's name"
        maxLength={15}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}