export default function SingleCenterCard(props: {
  logo?: boolean;
  insetLogo?: boolean;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col justify-center py-0 sm:bg-transparent">
      {(!!props.logo || !!props.title || !!props.subtitle) && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-6 w-auto"
            src="/images/logo_colors.svg"
            alt="Workflow"
          />
          {!!props.title && (
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {props.title}
            </h2>
          )}
          {!!props.subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {props.subtitle}
            </p>
          )}
        </div>
      )}

      <div
        style={{ zIndex: 1 }}
        className="mt-0 mb-0 h-full sm:mb-12 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="py-8 px-4 sm:shadow-lg sm:rounded-lg sm:px-10 sm:bg-white ">
          {props.insetLogo && (
            <img
              className="mx-auto h-6 w-auto mb-4"
              src="/images/logo_colors.svg"
              alt="Workflow"
            />
          )}

          {props.children}
        </div>
      </div>
    </div>
  );
}
