using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GradeSense.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPhoneAndMultipleEmails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Users",
                newName: "PersonalEmail");

            migrationBuilder.RenameIndex(
                name: "idx_users_email",
                table: "Users",
                newName: "idx_users_personal_email");

            migrationBuilder.AddColumn<string>(
                name: "InstitutionalEmail",
                table: "Users",
                type: "varchar(255)",
                unicode: false,
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImagePath",
                table: "Users",
                type: "varchar(500)",
                unicode: false,
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "idx_users_institutional_email",
                table: "Users",
                column: "InstitutionalEmail",
                unique: true,
                filter: "[InstitutionalEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "idx_users_phone",
                table: "Users",
                column: "PhoneNumber",
                unique: true,
                filter: "[PhoneNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_InstitutionalEmail",
                table: "Users",
                column: "InstitutionalEmail",
                unique: true,
                filter: "[InstitutionalEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users",
                column: "PhoneNumber",
                unique: true,
                filter: "[PhoneNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_users_institutional_email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "idx_users_phone",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_InstitutionalEmail",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "InstitutionalEmail",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfileImagePath",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "PersonalEmail",
                table: "Users",
                newName: "Email");

            migrationBuilder.RenameIndex(
                name: "idx_users_personal_email",
                table: "Users",
                newName: "idx_users_email");
        }
    }
}
