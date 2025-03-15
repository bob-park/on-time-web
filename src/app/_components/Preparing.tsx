import CardPageTitle from './CardPageTitle';

export default function Preparing() {
  return (
    <div className="mt-36 flex cursor-default flex-row items-center justify-center gap-4 text-9xl font-bold text-gray-400 select-none">
      <CardPageTitle placeholder="열심히">
        <span>준</span>
      </CardPageTitle>
      <CardPageTitle placeholder="만드는 중">
        <span>비</span>
      </CardPageTitle>
      <CardPageTitle placeholder="데헷 ^_^">
        <span>중</span>
      </CardPageTitle>
    </div>
  );
}
